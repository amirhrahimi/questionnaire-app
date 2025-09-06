-- Sample data for Questionnaire system with GUID IDs
-- Run this after applying the migration to populate with test data

-- Insert sample questionnaires
INSERT INTO "Questionnaires" ("Id", "Title", "Description", "CreatedAt", "IsActive") VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Customer Satisfaction Survey', 'Help us improve our services by sharing your feedback', '2024-09-01 10:00:00+00', true),
('b2c3d4e5-f6a7-8901-bcde-f21234567891', 'Employee Engagement Survey', 'Share your thoughts about working at our company', '2024-09-02 14:30:00+00', true),
('c3d4e5f6-a7b8-9012-cdef-321234567892', 'Product Feedback Form', 'Tell us what you think about our latest product', '2024-09-03 09:15:00+00', false),
('d4e5f6a7-b8c9-0123-defa-432134567893', 'Health & Wellness Survey', 'Help us understand your health and wellness needs', '2024-09-04 11:20:00+00', true),
('e5f6a7b8-c9d0-1234-efab-543234567894', 'Technology Usage Assessment', 'Survey about technology tools and preferences', '2024-09-05 13:45:00+00', true),
('f6a7b8c9-d0e1-2345-fabc-654334567895', 'Event Planning Questionnaire', 'Planning our upcoming company events', '2024-09-06 09:30:00+00', true),
('a7b8c9d0-e1f2-3456-abcd-765434567896', 'Remote Work Experience', 'Your experience with remote work arrangements', '2024-09-07 16:00:00+00', false),
('b8c9d0e1-f2a3-4567-bcde-876534567897', 'Training Needs Analysis', 'Identify training and development opportunities', '2024-09-08 10:15:00+00', true);

-- Insert questions for Customer Satisfaction Survey
INSERT INTO "Questions" ("Id", "Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
(1, 'How would you rate our overall service?', 1, true, 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
(2, 'Which of the following features do you use most? (Select all that apply)', 2, true, 2, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
(3, 'Please describe what we could improve:', 3, false, 3, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- Insert questions for Employee Engagement Survey
INSERT INTO "Questions" ("Id", "Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
(4, 'How satisfied are you with your current role?', 1, true, 1, 'b2c3d4e5-f6a7-8901-bcde-f21234567891'),
(5, 'What motivates you most at work? (Select all that apply)', 2, true, 2, 'b2c3d4e5-f6a7-8901-bcde-f21234567891'),
(6, 'Any additional comments or suggestions?', 3, false, 3, 'b2c3d4e5-f6a7-8901-bcde-f21234567891');

-- Insert questions for Product Feedback Form
INSERT INTO "Questions" ("Id", "Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
(7, 'How likely are you to recommend this product?', 1, true, 1, 'c3d4e5f6-a7b8-9012-cdef-321234567892'),
(8, 'What features would you like to see added?', 3, true, 2, 'c3d4e5f6-a7b8-9012-cdef-321234567892');

-- Insert questions for Health & Wellness Survey
INSERT INTO "Questions" ("Id", "Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
(9, 'How would you rate your overall health?', 1, true, 1, 'd4e5f6a7-b8c9-0123-defa-432134567893'),
(10, 'Which wellness programs are you interested in? (Select all that apply)', 2, true, 2, 'd4e5f6a7-b8c9-0123-defa-432134567893'),
(11, 'How many hours do you exercise per week?', 1, true, 3, 'd4e5f6a7-b8c9-0123-defa-432134567893'),
(12, 'What health challenges do you currently face?', 3, false, 4, 'd4e5f6a7-b8c9-0123-defa-432134567893');

-- Insert questions for Technology Usage Assessment
INSERT INTO "Questions" ("Id", "Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
(13, 'What is your primary operating system?', 1, true, 1, 'e5f6a7b8-c9d0-1234-efab-543234567894'),
(14, 'Which collaboration tools do you use regularly? (Select all that apply)', 2, true, 2, 'e5f6a7b8-c9d0-1234-efab-543234567894'),
(15, 'How comfortable are you with new technology?', 1, true, 3, 'e5f6a7b8-c9d0-1234-efab-543234567894'),
(16, 'What technology training would be most helpful?', 3, false, 4, 'e5f6a7b8-c9d0-1234-efab-543234567894');

-- Insert questions for Event Planning Questionnaire
INSERT INTO "Questions" ("Id", "Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
(17, 'What type of events interest you most?', 2, true, 1, 'f6a7b8c9-d0e1-2345-fabc-654334567895'),
(18, 'What is your preferred event timing?', 1, true, 2, 'f6a7b8c9-d0e1-2345-fabc-654334567895'),
(19, 'What is your budget range for events?', 1, true, 3, 'f6a7b8c9-d0e1-2345-fabc-654334567895'),
(20, 'Any specific event suggestions or themes?', 3, false, 4, 'f6a7b8c9-d0e1-2345-fabc-654334567895');

-- Insert questions for Remote Work Experience
INSERT INTO "Questions" ("Id", "Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
(21, 'How satisfied are you with remote work?', 1, true, 1, 'a7b8c9d0-e1f2-3456-abcd-765434567896'),
(22, 'What are the biggest challenges of remote work? (Select all that apply)', 2, true, 2, 'a7b8c9d0-e1f2-3456-abcd-765434567896'),
(23, 'How many days per week would you prefer to work from home?', 1, true, 3, 'a7b8c9d0-e1f2-3456-abcd-765434567896'),
(24, 'What would improve your remote work experience?', 3, false, 4, 'a7b8c9d0-e1f2-3456-abcd-765434567896');

-- Insert questions for Training Needs Analysis
INSERT INTO "Questions" ("Id", "Text", "Type", "IsRequired", "Order", "QuestionnaireId") VALUES
(25, 'What is your current skill level in your role?', 1, true, 1, 'b8c9d0e1-f2a3-4567-bcde-876534567897'),
(26, 'Which skills would you like to develop? (Select all that apply)', 2, true, 2, 'b8c9d0e1-f2a3-4567-bcde-876534567897'),
(27, 'What is your preferred learning format?', 1, true, 3, 'b8c9d0e1-f2a3-4567-bcde-876534567897'),
(28, 'What specific training topics interest you most?', 3, false, 4, 'b8c9d0e1-f2a3-4567-bcde-876534567897');

-- Insert question options for single/multiple choice questions

-- Options for "How would you rate our overall service?" (Question 1)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(1, 'Excellent', 1, 1),
(2, 'Good', 2, 1),
(3, 'Fair', 3, 1),
(4, 'Poor', 4, 1);

-- Options for "Which features do you use most?" (Question 2)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(5, 'Online Chat Support', 1, 2),
(6, 'Phone Support', 2, 2),
(7, 'Email Support', 3, 2),
(8, 'Knowledge Base', 4, 2),
(9, 'Video Tutorials', 5, 2);

-- Options for "How satisfied are you with your current role?" (Question 4)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(10, 'Very Satisfied', 1, 4),
(11, 'Satisfied', 2, 4),
(12, 'Neutral', 3, 4),
(13, 'Dissatisfied', 4, 4),
(14, 'Very Dissatisfied', 5, 4);

-- Options for "What motivates you most at work?" (Question 5)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(15, 'Career Growth', 1, 5),
(16, 'Competitive Salary', 2, 5),
(17, 'Work-Life Balance', 3, 5),
(18, 'Team Collaboration', 4, 5),
(19, 'Recognition', 5, 5),
(20, 'Learning Opportunities', 6, 5);

-- Options for "How likely are you to recommend this product?" (Question 7)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(21, 'Very Likely', 1, 7),
(22, 'Likely', 2, 7),
(23, 'Neutral', 3, 7),
(24, 'Unlikely', 4, 7),
(25, 'Very Unlikely', 5, 7);

-- Options for "How would you rate your overall health?" (Question 9)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(26, 'Excellent', 1, 9),
(27, 'Very Good', 2, 9),
(28, 'Good', 3, 9),
(29, 'Fair', 4, 9),
(30, 'Poor', 5, 9);

-- Options for "Which wellness programs are you interested in?" (Question 10)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(31, 'Fitness Classes', 1, 10),
(32, 'Mental Health Support', 2, 10),
(33, 'Nutrition Counseling', 3, 10),
(34, 'Stress Management', 4, 10),
(35, 'Health Screenings', 5, 10),
(36, 'Wellness Workshops', 6, 10);

-- Options for "How many hours do you exercise per week?" (Question 11)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(37, '0 hours', 1, 11),
(38, '1-2 hours', 2, 11),
(39, '3-5 hours', 3, 11),
(40, '6-8 hours', 4, 11),
(41, '9+ hours', 5, 11);

-- Options for "What is your primary operating system?" (Question 13)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(42, 'Windows', 1, 13),
(43, 'macOS', 2, 13),
(44, 'Linux', 3, 13),
(45, 'Chrome OS', 4, 13),
(46, 'Other', 5, 13);

-- Options for "Which collaboration tools do you use regularly?" (Question 14)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(47, 'Microsoft Teams', 1, 14),
(48, 'Slack', 2, 14),
(49, 'Zoom', 3, 14),
(50, 'Google Workspace', 4, 14),
(51, 'Discord', 5, 14),
(52, 'Trello', 6, 14),
(53, 'Asana', 7, 14);

-- Options for "How comfortable are you with new technology?" (Question 15)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(54, 'Very Comfortable', 1, 15),
(55, 'Comfortable', 2, 15),
(56, 'Somewhat Comfortable', 3, 15),
(57, 'Uncomfortable', 4, 15),
(58, 'Very Uncomfortable', 5, 15);

-- Options for "What type of events interest you most?" (Question 17)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(59, 'Team Building Activities', 1, 17),
(60, 'Professional Development', 2, 17),
(61, 'Social Events', 3, 17),
(62, 'Networking Events', 4, 17),
(63, 'Wellness Activities', 5, 17),
(64, 'Community Service', 6, 17);

-- Options for "What is your preferred event timing?" (Question 18)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(65, 'During work hours', 1, 18),
(66, 'After work hours', 2, 18),
(67, 'Lunch time', 3, 18),
(68, 'Weekends', 4, 18),
(69, 'Flexible timing', 5, 18);

-- Options for "What is your budget range for events?" (Question 19)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(70, 'Under $25', 1, 19),
(71, '$25-$50', 2, 19),
(72, '$50-$100', 3, 19),
(73, '$100-$200', 4, 19),
(74, 'Over $200', 5, 19);

-- Options for "How satisfied are you with remote work?" (Question 21)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(75, 'Very Satisfied', 1, 21),
(76, 'Satisfied', 2, 21),
(77, 'Neutral', 3, 21),
(78, 'Dissatisfied', 4, 21),
(79, 'Very Dissatisfied', 5, 21);

-- Options for "What are the biggest challenges of remote work?" (Question 22)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(80, 'Communication', 1, 22),
(81, 'Collaboration', 2, 22),
(82, 'Work-life balance', 3, 22),
(83, 'Technology issues', 4, 22),
(84, 'Isolation', 5, 22),
(85, 'Distractions at home', 6, 22);

-- Options for "How many days per week would you prefer to work from home?" (Question 23)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(86, '0 days (office only)', 1, 23),
(87, '1 day', 2, 23),
(88, '2 days', 3, 23),
(89, '3 days', 4, 23),
(90, '4 days', 5, 23),
(91, '5 days (fully remote)', 6, 23);

-- Options for "What is your current skill level in your role?" (Question 25)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(92, 'Beginner', 1, 25),
(93, 'Intermediate', 2, 25),
(94, 'Advanced', 3, 25),
(95, 'Expert', 4, 25);

-- Options for "Which skills would you like to develop?" (Question 26)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(96, 'Leadership', 1, 26),
(97, 'Communication', 2, 26),
(98, 'Technical Skills', 3, 26),
(99, 'Project Management', 4, 26),
(100, 'Data Analysis', 5, 26),
(101, 'Time Management', 6, 26),
(102, 'Creative Thinking', 7, 26);

-- Options for "What is your preferred learning format?" (Question 27)
INSERT INTO "QuestionOptions" ("Id", "Text", "Order", "QuestionId") VALUES
(103, 'Online Courses', 1, 27),
(104, 'In-person Workshops', 2, 27),
(105, 'Video Tutorials', 3, 27),
(106, 'Reading Materials', 4, 27),
(107, 'Mentoring', 5, 27),
(108, 'Hands-on Practice', 6, 27);

-- Insert some sample responses
INSERT INTO "QuestionnaireResponses" ("Id", "QuestionnaireId", "SubmittedAt") VALUES
(1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2024-09-04 10:30:00+00'),
(2, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2024-09-04 14:15:00+00'),
(3, 'b2c3d4e5-f6a7-8901-bcde-f21234567891', '2024-09-04 16:45:00+00'),
(4, 'd4e5f6a7-b8c9-0123-defa-432134567893', '2024-09-05 09:20:00+00'),
(5, 'e5f6a7b8-c9d0-1234-efab-543234567894', '2024-09-05 11:35:00+00'),
(6, 'f6a7b8c9-d0e1-2345-fabc-654334567895', '2024-09-05 15:40:00+00'),
(7, 'b8c9d0e1-f2a3-4567-bcde-876534567897', '2024-09-06 08:15:00+00');

-- Insert individual responses for the sample questionnaire responses

-- Response 1: Customer rated "Good" service
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(1, 1, 2, NULL);

-- Response 1: Customer uses Online Chat and Email Support
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(2, 1, 5, NULL),
(2, 1, 7, NULL);

-- Response 1: Customer's descriptive feedback
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(3, 1, NULL, 'The response time could be faster, but overall good experience.');

-- Response 2: Another customer rated "Excellent" service
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(1, 2, 1, NULL);

-- Response 2: Customer uses Phone Support and Knowledge Base
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(2, 2, 6, NULL),
(2, 2, 8, NULL);

-- Response 3: Employee is "Satisfied" with role
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(4, 3, 11, NULL);

-- Response 3: Employee is motivated by Career Growth and Work-Life Balance
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(5, 3, 15, NULL),
(5, 3, 17, NULL);

-- Response 3: Employee's additional comments
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(6, 3, NULL, 'More flexible working hours would be appreciated.');

-- Response 4: Health & Wellness Survey responses
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(9, 4, 28, NULL), -- Good health
(10, 4, 31, NULL), -- Fitness Classes
(10, 4, 34, NULL), -- Stress Management
(11, 4, 39, NULL), -- 3-5 hours exercise
(12, 4, NULL, 'Better work-life balance to reduce stress levels.');

-- Response 5: Technology Usage Assessment responses
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(13, 5, 42, NULL), -- Windows
(14, 5, 47, NULL), -- Microsoft Teams
(14, 5, 50, NULL), -- Google Workspace
(15, 5, 55, NULL), -- Comfortable
(16, 5, NULL, 'Training on AI tools and automation would be valuable.');

-- Response 6: Event Planning Questionnaire responses
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(17, 6, 59, NULL), -- Team Building Activities
(17, 6, 61, NULL), -- Social Events
(18, 6, 66, NULL), -- After work hours
(19, 6, 72, NULL), -- $50-$100
(20, 6, NULL, 'Outdoor team building activities like escape rooms or cooking classes.');

-- Response 7: Training Needs Analysis responses
INSERT INTO "Responses" ("QuestionId", "QuestionnaireResponseId", "QuestionOptionId", "TextAnswer") VALUES
(25, 7, 93, NULL), -- Intermediate
(26, 7, 96, NULL), -- Leadership
(26, 7, 99, NULL), -- Project Management
(27, 7, 103, NULL), -- Online Courses
(28, 7, NULL, 'Leadership communication skills and conflict resolution techniques.');

-- Insert a sample admin user (optional)
INSERT INTO "Users" ("Id", "GoogleId", "Email", "Name", "Picture", "IsAdmin", "CreatedAt", "LastLoginAt") VALUES
(1, 'google123456789', 'admin@example.com', 'Admin User', 'https://via.placeholder.com/150', true, '2024-09-01 08:00:00+00', '2024-09-01 08:00:00+00');

-- Query to verify the data was inserted correctly
-- SELECT 
--     q."Title" as "Questionnaire",
--     quest."Text" as "Question",
--     quest."Type" as "QuestionType",
--     COUNT(qr."Id") as "ResponseCount"
-- FROM "Questionnaires" q
-- LEFT JOIN "Questions" quest ON q."Id" = quest."QuestionnaireId"
-- LEFT JOIN "QuestionnaireResponses" qr ON q."Id" = qr."QuestionnaireId"
-- GROUP BY q."Id", q."Title", quest."Id", quest."Text", quest."Type"
-- ORDER BY q."Title", quest."Order";
