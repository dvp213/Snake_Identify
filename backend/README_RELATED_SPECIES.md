# Snake Related Species Solution

## Problem

The application had an issue with adding related snake species due to a unique constraint on the `class_label` column in the `snakes` table. When adding related species, the system was trying to use the same class_label values, resulting in duplicate key errors.

## Solution

### 1. Database Schema Fix

We identified that the `class_label` column had a unique constraint that was causing the issue. We created and ran a script to remove this unique constraint, making it possible to have multiple snakes with the same class_label (including NULL):

```python
# In modify_schema.py
connection.execute(text(f"ALTER TABLE snakes DROP INDEX {idx[2]}"))
```

### 2. Updated Dependencies Management

We improved the dependency management by:

- Creating a dedicated `dependencies.py` file to handle common dependencies
- Moving `get_db`, `get_current_user`, and `admin_required` to this file
- Updating all router imports to use the new dependencies

```python
# In core/dependencies.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def admin_required(current_user = Depends(get_current_user)) -> Dict:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action, admin privileges required"
        )
    return {"is_admin": True}
```

### 3. Enhanced Snake Related Router

We created an improved router (`snake_related_improved.py`) that properly handles related species by:

- Setting `class_label` to NULL for related species
- Adding better error handling for database operations
- Supporting creation of main snake with related species in a single request

```python
# Example from the new router
db_related_snake = Snake(
    snakeenglishname=related_snake.snakeenglishname,
    snakesinhalaname=related_snake.snakesinhalaname,
    snakeenglishdescription=related_snake.snakeenglishdescription,
    snakesinhaladescription=related_snake.snakesinhaladescription,
    # Setting class_label to None to avoid unique constraint violation
    class_label=None,
    snakeimage=related_snake.snakeimage,
    snakeimage_type=related_snake.snakeimage_type,
)
```

### 4. Updated Schemas

We created improved schemas (`snake_improved.py`) that:

- Make `class_label` optional
- Add support for creating related snakes alongside main snake
- Add proper validation for request/response models

```python
class SnakeCreate(SnakeBase):
    # Add support for related snakes to be created with the main snake
    related_snakes: Optional[List[RelatedSnakeCreate]] = Field(default_factory=list)
```

### 5. Application Update

We updated the main application file to use our improved components:

- Using the new router
- Creating necessary static directories
- Ensuring proper CORS configuration

## How to Use

1. Run the application using:

   ```
   python -m uvicorn main_improved:app --reload
   ```

2. To create a snake with related species, use:

   ```
   POST /snake/create
   ```

   with payload containing both snake details and related species

3. To add a related snake to an existing one:

   ```
   POST /snake/{snake_id}/add-related
   ```

4. To link two existing snakes:

   ```
   POST /snake/{snake_id}/link/{related_id}
   ```

5. To get related snakes for a specific snake:

   ```
   GET /snake/{snake_id}/related
   ```

6. To remove a relationship:
   ```
   DELETE /snake/{snake_id}/unlink/{related_id}
   ```

## Technical Notes

- The database schema was modified to remove the unique constraint on `class_label`
- Related species now have NULL class_label values to avoid constraint violations
- Better error handling is in place to catch and report database issues
- Circular dependency issues were resolved through proper module organization
