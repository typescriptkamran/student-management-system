#! /usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';

const dataFilePath = 'students.json';

class Student {
  constructor(
    public name: string,
    public rollNo: string,
    public age: number,
    public grade: string,
    public studentClass: string,
    public section: string
  ) {}
}

function readDataFromFile(): Student[] {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveDataToFile(students: Student[]): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(students, null, 2), 'utf8');
}

async function main() {
  let students: Student[] = readDataFromFile();

  function displayStudents() {
    console.log(chalk.bold('List of Students:\n'));
    students.forEach((student, index) => {
      console.log(
        `${index + 1}. Name: ${student.name}, Roll No: ${student.rollNo}, Age: ${student.age}, Grade: ${student.grade}, Class: ${student.studentClass}, Section: ${student.section}`
      );
    });
    console.log('\n');
  }

  async function addStudent() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the student name:',
      },
      {
        type: 'input',
        name: 'rollNo',
        message: 'Enter the student roll number:',
      },
      {
        type: 'input',
        name: 'age',
        message: 'Enter the student age (between 12 and 70):',
        validate: (value) => {
          const age = parseInt(value);
          if (isNaN(age) || age < 12 || age > 70) {
            return 'Please enter a valid age between 12 and 70.';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'grade',
        message: 'Choose the student grade:',
        choices: ['A+', 'A', 'B', 'C', 'F'],
      },
      {
        type: 'list',
        name: 'studentClass',
        message: 'Choose the student class:',
        choices: ['Q1', 'Q2', 'Q3', 'Q4'],
      },
      {
        type: 'list',
        name: 'section',
        message: 'Choose the student section:',
        choices: ['Morning', 'Afternoon'],
      },
    ]);

    const newStudent = new Student(
      answers.name,
      answers.rollNo,
      parseInt(answers.age),
      answers.grade,
      answers.studentClass,
      answers.section
    );

    students.push(newStudent);
    saveDataToFile(students);
    console.log(chalk.green.bold('Student added successfully!\n'));
    displayStudents();
    promptAction();
  }

  function editStudent() {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'index',
          message: 'Enter the index of the student to edit:',
          validate: (value) => {
            const index = parseInt(value);
            if (isNaN(index) || index < 1 || index > students.length) {
              return 'Please enter a valid index.';
            }
            return true;
          },
        },
        // ...prompts for editing student fields
      ])
      .then((answers) => {
        const index = parseInt(answers.index) - 1;
        const studentToUpdate = students[index];

        inquirer
          .prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Enter the new student name:',
              default: studentToUpdate.name,
            },
            {
              type: 'input',
              name: 'rollNo',
              message: 'Enter the new student roll number:',
              default: studentToUpdate.rollNo,
            },
            {
              type: 'input',
              name: 'age',
              message: 'Enter the new student age (between 12 and 70):',
              default: studentToUpdate.age.toString(),
              validate: (value) => {
                const age = parseInt(value);
                if (isNaN(age) || age < 12 || age > 70) {
                  return 'Please enter a valid age between 12 and 70.';
                }
                return true;
              },
            },
            {
              type: 'list',
              name: 'grade',
              message: 'Choose the new student grade:',
              choices: ['A+', 'A', 'B', 'C', 'F'],
              default: studentToUpdate.grade,
            },
            {
              type: 'list',
              name: 'studentClass',
              message: 'Choose the new student class:',
              choices: ['Q1', 'Q2', 'Q3', 'Q4'],
              default: studentToUpdate.studentClass,
            },
            {
              type: 'list',
              name: 'section',
              message: 'Choose the new student section:',
              choices: ['Morning', 'Afternoon'],
              default: studentToUpdate.section,
            },
          ])
          .then((editAnswers) => {
            const updatedStudent = new Student(
              editAnswers.name,
              editAnswers.rollNo,
              parseInt(editAnswers.age),
              editAnswers.grade,
              editAnswers.studentClass,
              editAnswers.section
            );
            students[index] = updatedStudent;
            saveDataToFile(students);
            console.log(chalk.green.bold('Student information updated successfully!\n'));
            displayStudents();
            promptAction();
          });
      });
  }

  function removeStudent() {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'index',
          message: 'Enter the index of the student to remove:',
          validate: (value) => {
            const index = parseInt(value);
            if (isNaN(index) || index < 1 || index > students.length) {
              return 'Please enter a valid index.';
            }
            return true;
          },
        },
      ])
      .then((answers) => {
        const index = parseInt(answers.index) - 1;
        const removedStudent = students.splice(index, 1)[0];
        saveDataToFile(students);
        console.log(chalk.red.bold(`Student ${removedStudent.name} removed successfully!\n`));
        displayStudents();
        promptAction();
      });
  }
  function promptAction() {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Choose an action:',
          choices: ['Add Student', 'Edit Student', 'Remove Student', 'List Students', 'Exit'],
        },
      ])
      .then((answers) => {
        switch (answers.action) {
          case 'Add Student':
            addStudent();
            break;
          case 'Edit Student':
            editStudent();
            break;
          case 'Remove Student':
            removeStudent();
            break;
          case 'List Students':
            displayStudents();
            promptAction();
            break;
          case 'Exit':
            console.log(chalk.bold('Goodbye!'));
            process.exit();
        }
      });
  }

  console.log(chalk.bold('Student Management System\n'));
  promptAction();
}

main();
