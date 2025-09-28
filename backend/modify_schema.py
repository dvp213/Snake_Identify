from sqlalchemy import create_engine, text
from models.database import engine

def modify_database_schema():
    try:
        print("Connecting to database...")
        connection = engine.connect()
        transaction = connection.begin()
        
        try:
            print("Connected. Checking for unique constraint on class_label...")
            
            # Check if the unique constraint exists
            result = connection.execute(text("""
                SHOW INDEX FROM snakes WHERE Column_name = 'class_label' AND Non_unique = 0
            """))
            indexes = result.fetchall()
            
            if indexes:
                print(f"Found {len(indexes)} unique constraint(s) on class_label:")
                for idx in indexes:
                    print(f"  Index name: {idx[2]}")
                
                # Drop the unique constraint
                print("Dropping unique constraint on class_label...")
                for idx in indexes:
                    connection.execute(text(f"""
                        ALTER TABLE snakes DROP INDEX {idx[2]}
                    """))
                    print(f"  Dropped constraint: {idx[2]}")
                
                # Create a new non-unique index instead
                print("Creating non-unique index on class_label...")
                connection.execute(text("""
                    CREATE INDEX idx_class_label ON snakes (class_label)
                """))
                print("  Created non-unique index: idx_class_label")
                
                # Commit the transaction
                transaction.commit()
                print("Successfully modified schema!")
            else:
                print("No unique constraint found on class_label. No changes needed.")
                transaction.commit()
            
        except Exception as e:
            transaction.rollback()
            raise e
        finally:
            connection.close()
        
    except Exception as e:
        print(f"Error modifying database schema: {e}")

if __name__ == "__main__":
    modify_database_schema()