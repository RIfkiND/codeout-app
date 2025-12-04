-- Migration to ensure SQL programming language exists
-- Run this after creating the SQL challenges

-- Update or insert SQL language
INSERT INTO programming_languages (
    id, 
    name, 
    display_name, 
    file_extension, 
    monaco_language_id, 
    piston_language, 
    piston_version, 
    template_code, 
    is_active
) 
VALUES (
    'sql', 
    'sql', 
    'SQL', 
    '.sql', 
    'sql', 
    'sqlite3', 
    '3.36.0', 
    '-- Write your SQL query here
-- Example: SELECT * FROM table_name WHERE condition;
', 
    true
) ON CONFLICT (id) DO UPDATE SET
    piston_language = EXCLUDED.piston_language,
    piston_version = EXCLUDED.piston_version,
    template_code = EXCLUDED.template_code,
    is_active = EXCLUDED.is_active;