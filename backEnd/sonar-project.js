const sonarqubeScanner = require("sonarqube-scanner");
sonarqubeScanner(
  {
    serverUrl: "http://localhost:9000",
    options: {
      "sonar.sources": ".",
      "sonar.inclusions": "/**", // Entry point of your code
      "sonar.login": "admin",
      "sonar.password": "indianic",
      "sonar.token": "squ_f45a5040cb2660d65807aba3a75e53ed90cda8b1",
    },
  },
  () => {}
);
