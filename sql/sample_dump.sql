-- Sample SQL dump for initial roles and a demo user
INSERT INTO roles (id, name, created_at, updated_at) VALUES
(1,'Donor',NOW(),NOW()),
(2,'Recipient',NOW(),NOW()),
(3,'Technician',NOW(),NOW()),
(4,'Staff',NOW(),NOW()),
(5,'Admin',NOW(),NOW()),
(6,'MedicalStaff',NOW(),NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);
