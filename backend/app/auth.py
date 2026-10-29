from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from backend.app.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

from backend.app.database import (
    create_user,
    get_user_by_email,
)
password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token",
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(user_id: int) -> str:
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(user_id),
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


@router.post("/register")
def register_user(request: RegisterRequest):
    existing_user = get_user_by_email(
        request.email
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 6 characters.",
        )

    password_hash = hash_password(
        request.password
    )

    user_id = create_user(
        username=request.username,
        email=request.email,
        password_hash=password_hash,
    )

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists.",
        )

    return {
        "message": "Account created successfully.",
        "user": {
            "id": user_id,
            "username": request.username,
            "email": request.email,
        },
    }


@router.post("/login")
def login_user(request: LoginRequest):
    user = get_user_by_email(
        request.email
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        request.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(
        user["id"]
    )

    return {
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
        },
    }

@router.post("/token")
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    user = get_user_by_email(
        form_data.username
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        form_data.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(
        user["id"]
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

def get_current_user(
    token: str = Depends(oauth2_scheme),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    connection_user = None

    from backend.app.database import get_connection

    connection = get_connection()

    connection_user = connection.execute(
        """
        SELECT id, username, email
        FROM users
        WHERE id = ?
        """,
        (int(user_id),),
    ).fetchone()

    connection.close()

    if connection_user is None:
        raise credentials_exception

    return connection_user


@router.get("/me")
def get_me(
    current_user=Depends(get_current_user),
):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
    }