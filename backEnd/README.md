# JobCheck Node Project

## Prerequisite (Development)

| Module  | Version |
| ------- | ------- |
| Node    | 16.17.1 |
| Npm     | 8.15.0  |
| Mongodb | 4.4.4   |

## Running Project In Local

```bash
$ git clone http://git.indianic.com/ITGL/F2023-6286/javascript-frameworks-nodejs2.git

$ git checkout dev

$ cd ..

$ mv .env.sample .env(file data should not be change)

$ vi .env (need to change environment related details in this file.)

$ npm install

$ node server.js

```

---

## Code Quality Check

> Download Java Version 11

> Download SonarQuebe from https://www.sonarqube.org/downloads/

> Please add below line at end of the file soanrqube-7.9.1 > conf > sonar.properties #sonar.host.url=http://localhost:9000

> Install sonarqube-scanner from https://www.npmjs.com/package/sonarqube-scanner

> Follow Steps given in this link https://yuriburger.net/2017/09/27/getting-started-with-sonarqube-and-typescript/ Except Rules

> Command to start sonarquebe serving on localhost:9000 $ sonarqube-7.9.1/bin/macosx-universal-64/sonar.sh start

> Start analysis of project with following command $ sonar-scanner

## Deployment In Uat Server

```bash
$ git clone http://git.indianic.com/ITGL/F2023-6286/javascript-frameworks-nodejs2.git

$ git checkout uat

$ cd ..

$ mv .env.sample .env(file data should not be change)

$ vi .env (need to change environment related details in this file.)

$ cd ..

$ sh package.sh

```

## Deployment With CI/CD

> Coming Soon

## Node Coding Standards

> You can get more information on node coding stantdards from [here](https://docs.google.com/document/d/1_ejxCdzwZzWLrhy1xPmzSh8mt7pnz1p50vuHQSnVcXE/edit).

## Directory Structure

```
├── Dockerfile
├── README.md
├── app
|  ├── locales
|  |  ├── de.json
|  |  ├── en.json
|  |  └── es.json
|  ├── modules
|  |  ├── Admin
|  |  ├── AdminManagement
|  |  ├── AdminReports
|  |  ├── AdviserManagement
|  |  ├── Advisor
|  |  ├── Applicant
|  |  ├── ApplicantManagement
|  |  ├── Authentication
|  |  ├── Base
|  |  ├── BlogCategoryManagement
|  |  ├── BlogManagement
|  |  ├── Chat
|  |  ├── Common
|  |  ├── EmailTemplate
|  |  ├── Employer
|  |  ├── EmployerManagement
|  |  ├── FaqCategoryManagement
|  |  ├── FaqManagement
|  |  ├── FeedbackManagement
|  |  ├── Home
|  |  ├── JobManagement
|  |  ├── Jobs
|  |  ├── MasterCountryManagement
|  |  ├── MasterDataManagement
|  |  ├── MasterLanguageManagement
|  |  ├── MasterTimezoneManagement-bkp
|  |  ├── Otp
|  |  ├── Partners
|  |  ├── Roles
|  |  ├── Settings
|  |  ├── SettingsLanguagePreferences
|  |  ├── StaticPageManagement
|  |  ├── Support
|  |  ├── TestimonialManagement
|  |  ├── TutorialManagement
|  |  ├── UserManagement
|  |  ├── Users
|  |  └── cmsPagesManagement
|  └── services
|     ├── Adviser.js
|     ├── Applicant.js
|     ├── Common.js
|     ├── Cron.js
|     ├── Email.js
|     ├── Employer.js
|     ├── File.js
|     ├── Form.js
|     ├── Jobs.js
|     ├── Models.js
|     ├── Notifications.js
|     ├── RequestBody.js
|     ├── Seed.js
|     ├── User.js
|     ├── constant.js
|     ├── logger.js
|     ├── middleware
|     ├── permissions.js
|     └── validators
├── configs
|  ├── Globals.js
|  ├── commonlyUsedPassword.json
|  ├── configs.js
|  ├── express.js
|  └── mongoose.js
├── immigration-api.yaml
├── immigration-dev-api.yaml
├── immigration-qa-api.yaml
├── immigration-uat-api.yaml
├── logs
|  └── job-check-itgl.log
├── output.txt
├── package-lock.json
├── package.json
├── server.js
├── sonar-project.js
├── sonar-project.properties
├── swagger.json

```

---
