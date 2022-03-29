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
    db.query('INSERT INTO movies SET ?', req.body, function (err, result) {
        console.table(result);
        res.json(result);
      });
};

const addNewRole = () => {

};

const addNewEmployee = () => {

};

const updateRole = () => {

};

mainMenu();