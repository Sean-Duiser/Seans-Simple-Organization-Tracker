const inquirer = require('inquirer');
const fs = require('fs');
const mysql = require('mysql2');
require('console.table');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'organization_db',
});

const mainMenu = () => {
    return inquirer
        .prompt([
            {
                type: 'list',
                name: 'menu',
                message: 'What would you like to do?',
                choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role', 'exit']
            }])
        .then(userSelection => {
            switch (userSelection.menu) {
                case 'view all departments':
                    viewAllDepartments();
                    break;
                case 'view all roles':
                    viewAllRoles();
                    break;
                case 'view all employees':
                    viewAllEmployees();
                    break;
                case 'add a department':
                    addNewDepartment();
                    break;
                case 'add a role':
                    addNewRole();
                    break;
                case 'add an employee':
                    addNewEmployee();
                    break;
                case 'update an employee role':
                    updateRole();
                    break;
                default:
                    process.exit();
            }
        })
};

const viewAllDepartments = () => {
    connection.query(`
        SELECT * 
        FROM department;
        `,
        (err, results) => {
            console.table(results);
            mainMenu();
        }
    )
};

const viewAllRoles = () => {
    connection.query(`
        SELECT * 
        FROM role;
        `,
        (err, results) => {
            console.table(results);
            mainMenu();
        }
    )
};

const viewAllEmployees = () => {
    connection.query(`
        SELECT * 
        FROM employee
        INNER JOIN role
        ON employee.role_id = role.id
        LEFT JOIN department
        ON role.department_id = department.id;
        `,
        (err, results) => {
            console.table(results);
            mainMenu();
        }
    )
};

const addNewDepartment = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of the new department?'
            }
        ])
        .then(name => {
            connection.query(`INSERT INTO department SET ?`, name);
            viewAllDepartments();
        })
};

const addNewRole = () => {
    connection.promise().query(`SELECT department.id, department.name FROM department;`)
        .then(([allDepartments]) => {
            let selectDepartment = allDepartments.map(({
                id,
                name
            }) => ({
                name: name,
                value: id
            }));
            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: 'What is the name of the new role?'
                    },
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which department is the new role a part of?',
                        choices: selectDepartment
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the salary of the new role?'
                    }])
                .then(({ title, department, salary }) => {
                    connection.query(`INSERT INTO role SET ?`, {
                        title: title,
                        department_id: department,
                        salary: salary
                    });
                    viewAllRoles();
                })
        })
};

const addNewEmployee = () => {
    connection.promise().query(`SELECT role.id, role.title FROM role;`)
        .then(([allRoles]) => {
            let selectRole = allRoles.map(({
                id,
                title
            }) => ({
                value: id,
                name: title
            }))
            connection.promise().query(`SELECT employee.id, CONCAT(employee.first_name,' ',employee.last_name) AS manager FROM employee;`)
                .then(([potentialManagers]) => {
                    let selectManager = potentialManagers.map(({
                        id,
                        manager
                    }) => ({
                        value: id,
                        name: manager
                    }));
                    inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'firstName',
                                message: 'What is the first name of the new employee?'
                            },
                            {
                                type: 'input',
                                name: 'lastName',
                                message: 'What is the last name of the new employee?'
                            },
                            {
                                type: 'list',
                                name: 'role',
                                message: 'Which role is the new employee assigned to?',
                                choices: selectRole
                            },
                            {
                                type: 'list',
                                name: 'manager',
                                message: 'Who is the manager of the new employee?',
                                choices: selectManager
                            }])
                        .then(({ firstName, lastName, role, manager }) => {
                            connection.query(`INSERT INTO employee SET ?`, {
                                first_name: firstName,
                                last_name: lastName,
                                role_id: role,
                                manager_id: manager
                            });
                            viewAllEmployees();
                        })
                })
        })
};

const updateRole = () => {
    connection.promise().query(`SELECT employee.id, CONCAT(employee.first_name,' ',employee.last_name) AS name FROM employee;`)
        .then(([currentEmployees]) => {
            let employeeSelection = currentEmployees.map(({
                id,
                name
            }) => ({
                name: name,
                value: id
            }));
            connection.promise().query(`SELECT role.id, role.title FROM role;`)
                .then(([currentRoles]) => {
                    let roleSelection = currentRoles.map(({
                        id,
                        title
                    }) => ({
                        name: title,
                        value: id
                    }));
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'selectEmployee',
                                message: 'Which employee would you like to select?',
                                choices: employeeSelection
                            },
                            {
                                type: 'list',
                                name: 'selectNewRole',
                                message: 'What is the new role for this employee?',
                                choices: roleSelection
                            }
                        ])
                        .then(({ selectEmployee, selectNewRole }) => {
                            connection.query(`UPDATE employee SET role_id = ${selectNewRole} WHERE id = ${selectEmployee}`);
                            viewAllEmployees();
                        })
                })
        })
};

mainMenu();