-- Fix template connections and ensure proper challenge template system
-- This migration ensures challenges can have custom templates per language

-- 1. Add template_overrides field to challenges table for language-specific templates
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS template_overrides JSONB DEFAULT '{}';

-- 2. Add helper function to get challenge template for specific language
CREATE OR REPLACE FUNCTION get_challenge_template(
    p_challenge_id UUID,
    p_language_name TEXT
) RETURNS TEXT AS $$
DECLARE
    template_override TEXT;
    default_template TEXT;
BEGIN
    -- First check if challenge has a specific template override for this language
    SELECT (template_overrides ->> p_language_name) 
    INTO template_override
    FROM public.challenges 
    WHERE id = p_challenge_id;
    
    -- If override exists, return it
    IF template_override IS NOT NULL AND template_override != '' THEN
        RETURN template_override;
    END IF;
    
    -- Otherwise, return default template from programming_languages
    SELECT template_code 
    INTO default_template
    FROM public.programming_languages 
    WHERE name = p_language_name AND is_active = true;
    
    -- Return default template or fallback
    RETURN COALESCE(default_template, 'function solution() {\n    // Your code here\n    return null;\n}');
END;
$$ LANGUAGE plpgsql;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION get_challenge_template(UUID, TEXT) TO authenticated;

-- 4. Create view for admin dashboard to see template usage
CREATE OR REPLACE VIEW admin_template_stats AS
SELECT 
    pl.name as language,
    pl.display_name,
    COUNT(DISTINCT c.id) as challenges_with_overrides,
    pl.template_code IS NOT NULL as has_default_template
FROM programming_languages pl
LEFT JOIN challenges c ON c.template_overrides ? pl.name
WHERE pl.is_active = true
GROUP BY pl.name, pl.display_name, pl.template_code
ORDER BY pl.display_name;

-- 5. Grant access to the view
GRANT SELECT ON admin_template_stats TO authenticated;

-- 6. Update existing challenges to have better default JavaScript templates for common challenges
UPDATE public.challenges 
SET template_overrides = jsonb_set(
    COALESCE(template_overrides, '{}'),
    '{javascript}',
    '"/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}\n\n// Test cases\nconsole.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]\nconsole.log(twoSum([3,2,4], 6));     // Expected: [1,2]"'
)
WHERE title ILIKE '%two sum%';

UPDATE public.challenges 
SET template_overrides = jsonb_set(
    COALESCE(template_overrides, '{}'),
    '{python}',
    '"def two_sum(nums, target):\n    \"\"\"\n    :type nums: List[int]\n    :type target: int\n    :rtype: List[int]\n    \"\"\"\n    # Your solution here\n    pass\n\n# Test cases\nprint(two_sum([2,7,11,15], 9))  # Expected: [0,1]\nprint(two_sum([3,2,4], 6))      # Expected: [1,2]"'
)
WHERE title ILIKE '%two sum%';

-- 7. Add comment column to challenge_templates for better organization
ALTER TABLE public.challenge_templates 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- 8. Create index for better performance on template lookups
CREATE INDEX IF NOT EXISTS idx_challenges_template_overrides ON public.challenges USING GIN (template_overrides);

SELECT 'Template connections fixed successfully!' as status;