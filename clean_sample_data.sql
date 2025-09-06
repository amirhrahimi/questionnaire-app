-- Clean sample data script - Run this to clear existing data and insert fresh data
-- This version avoids ID conflicts by letting PostgreSQL auto-generate IDs

-- Clear existing data in the correct order (respecting foreign keys)
TRUNCATE TABLE "Responses" CASCADE;
TRUNCATE TABLE "QuestionOptions" CASCADE;
TRUNCATE TABLE "Questions" CASCADE;
TRUNCATE TABLE "QuestionnaireResponses" CASCADE;
TRUNCATE TABLE "Questionnaires" CASCADE;
TRUNCATE TABLE "Users" CASCADE;

-- Reset sequences for auto-incrementing columns
SELECT setval(pg_get_serial_sequence('"Questions"', 'Id'), 1, false);
SELECT setval(pg_get_serial_sequence('"QuestionOptions"', 'Id'), 1, false);
SELECT setval(pg_get_serial_sequence('"QuestionnaireResponses"', 'Id'), 1, false);
SELECT setval(pg_get_serial_sequence('"Responses"', 'Id'), 1, false);
SELECT setval(pg_get_serial_sequence('"Users"', 'Id'), 1, false);

-- Insert sample questionnaires
INSERT INTO "Questionnaires" ("Id", "Title", "Description", "CreatedAt", "IsActive") VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Customer Satisfaction Survey', 'Help us improve our services by sharing your feedback', '2024-09-01 10:00:00+00', true),
('b2c3d4e5-f6a7-8901-bcde-f21234567891', 'Employee Engagement Survey', 'Share your thoughts about working at our company', '2024-09-02 14:30:00+00', true),
('c3d4e5f6-a7b8-9012-cdef-321234567892', 'Product Feedback Form', 'Tell us what you think about our latest product', '2024-09-03 09:15:00+00', false),
('d4e5f6a7-b8c9-0123-defa-432134567893', 'Health & Wellness Survey', 'Help us understand your health and wellness needs', '2024-09-04 11:20:00+00', true),
('e5f6a7b8-c9d0-1234-efab-543234567894', 'Technology Usage Assessment', 'Survey about technology tools and preferences', '2024-09-05 13:45:00+00', true);

-- Insert questions for Customer Satisfaction Survey
INSERT INTO "Questions" ("Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
('How would you rate our overall service?', 1, true, 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('Which of the following features do you use most? (Select all that apply)', 2, true, 2, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('Please describe what we could improve:', 3, false, 3, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- Insert questions for Employee Engagement Survey
INSERT INTO "Questions" ("Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
('How satisfied are you with your current role?', 1, true, 1, 'b2c3d4e5-f6a7-8901-bcde-f21234567891'),
('What motivates you most at work? (Select all that apply)', 2, true, 2, 'b2c3d4e5-f6a7-8901-bcde-f21234567891'),
('Any additional comments or suggestions?', 3, false, 3, 'b2c3d4e5-f6a7-8901-bcde-f21234567891');

-- Insert questions for Health & Wellness Survey
INSERT INTO "Questions" ("Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
('How would you rate your overall health?', 1, true, 1, 'd4e5f6a7-b8c9-0123-defa-432134567893'),
('Which wellness programs are you interested in? (Select all that apply)', 2, true, 2, 'd4e5f6a7-b8c9-0123-defa-432134567893'),
('How many hours do you exercise per week?', 1, true, 3, 'd4e5f6a7-b8c9-0123-defa-432134567893');

-- Insert questions for Technology Usage Assessment
INSERT INTO "Questions" ("Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
('What is your primary operating system?', 1, true, 1, 'e5f6a7b8-c9d0-1234-efab-543234567894'),
('Which collaboration tools do you use regularly? (Select all that apply)', 2, true, 2, 'e5f6a7b8-c9d0-1234-efab-543234567894'),
('How comfortable are you with new technology?', 1, true, 3, 'e5f6a7b8-c9d0-1234-efab-543234567894');

-- Insert question options (let PostgreSQL auto-generate IDs)
-- Options for Customer Satisfaction Survey questions
INSERT INTO "QuestionOptions" ("Text", "Order", "QuestionId") VALUES
('Excellent', 1, 1), ('Good', 2, 1), ('Fair', 3, 1), ('Poor', 4, 1),
('Online Chat Support', 1, 2), ('Phone Support', 2, 2), ('Email Support', 3, 2), ('Knowledge Base', 4, 2);

-- Options for Employee Engagement Survey questions  
INSERT INTO "QuestionOptions" ("Text", "Order", "QuestionId") VALUES
('Very Satisfied', 1, 4), ('Satisfied', 2, 4), ('Neutral', 3, 4), ('Dissatisfied', 4, 4),
('Career Growth', 1, 5), ('Competitive Salary', 2, 5), ('Work-Life Balance', 3, 5), ('Team Collaboration', 4, 5);

-- Options for Health & Wellness Survey questions
INSERT INTO "QuestionOptions" ("Text", "Order", "QuestionId") VALUES
('Excellent', 1, 7), ('Very Good', 2, 7), ('Good', 3, 7), ('Fair', 4, 7), ('Poor', 5, 7),
('Fitness Classes', 1, 8), ('Mental Health Support', 2, 8), ('Nutrition Counseling', 3, 8),
('0 hours', 1, 9), ('1-2 hours', 2, 9), ('3-5 hours', 3, 9), ('6+ hours', 4, 9);

-- Options for Technology Usage Assessment questions
INSERT INTO "QuestionOptions" ("Text", "Order", "QuestionId") VALUES
('Windows', 1, 10), ('macOS', 2, 10), ('Linux', 3, 10), ('Other', 4, 10),
('Microsoft Teams', 1, 11), ('Slack', 2, 11), ('Zoom', 3, 11), ('Google Workspace', 4, 11),
('Very Comfortable', 1, 12), ('Comfortable', 2, 12), ('Somewhat Comfortable', 3, 12), ('Uncomfortable', 4, 12);

-- Insert sample admin user
INSERT INTO "Users" ("GoogleId", "Email", "Name", "Picture", "IsAdmin", "CreatedAt", "LastLoginAt") VALUES
('google123456789', 'admin@example.com', 'Admin User', 'https://via.placeholder.com/150', true, '2024-09-01 08:00:00+00', '2024-09-01 08:00:00+00');

-- Insert some sample questionnaire responses (let PostgreSQL auto-generate IDs)
INSERT INTO "QuestionnaireResponses" ("QuestionnaireId", "SubmittedAt") VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2024-09-04 10:30:00+00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2024-09-04 14:15:00+00'),
('b2c3d4e5-f6a7-8901-bcde-f21234567891', '2024-09-04 16:45:00+00');

-- Insert individual responses (let PostgreSQL auto-generate IDs)
-- Customer Satisfaction responses
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(1, 1, 2, NULL), -- Good service
(2, 1, 5, NULL), -- Online Chat Support
(2, 1, 7, NULL), -- Email Support  
(3, 1, NULL, 'Response time could be faster, but overall good experience.'),
(1, 2, 1, NULL), -- Excellent service
(2, 2, 6, NULL), -- Phone Support
(2, 2, 8, NULL); -- Knowledge Base

-- Employee Engagement responses
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(4, 3, 13, NULL), -- Satisfied with role
(5, 3, 17, NULL), -- Career Growth motivation
(5, 3, 19, NULL), -- Work-Life Balance motivation
(6, 3, NULL, 'More flexible working hours would be appreciated.');

-- Verification query
SELECT 
    q."Title" as "Questionnaire",
    q."IsActive" as "Active",
    COUNT(DISTINCT quest."Id") as "Questions",
    COUNT(DISTINCT qr."Id") as "Responses"
FROM "Questionnaires" q
LEFT JOIN "Questions" quest ON q."Id" = quest."QuestionnaireId"
LEFT JOIN "QuestionnaireResponses" qr ON q."Id" = qr."QuestionnaireId"
GROUP BY q."Id", q."Title", q."IsActive", q."CreatedAt"
ORDER BY q."CreatedAt";
