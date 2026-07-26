from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.api.deps import get_current_user
from app.seed import seed_data

router = APIRouter()


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    # Auto-seed if demo login is attempted and user doesn't exist yet
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    
    if not user and user_in.email == "demo@trackr.dev":
        await seed_data()
        result = await db.execute(select(User).where(User.email == user_in.email))
        user = result.scalars().first()

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, user=UserResponse.model_validate(user))


@router.post("/seed")
async def seed_database():
    await seed_data()
    return {"status": "ok", "message": "Database successfully seeded with demo data"}


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
