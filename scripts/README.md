# Scripts

See [https://github.com/github/scripts-to-rule-them-all](https://github.com/github/scripts-to-rule-them-all)
for additional background on these scripts.

Below is a list of scripts available, along with a simple description of
what each one does. The details of what they are doing is available within the
script.

[`pre-bootstrap`](pre-bootstrap)
Directs towards base development machine setup.

[`bootstrap`](bootstrap)
Installs project's direct dependencies e.g. npm packages.

[`start`](start)
Starts the application in a Docker container.

[`start-small`](start)
Starts a partial ETL that only processes 90 pharmacies in a Docker container.

[`test`](test)
Starts a Docker container specifically for continually running tests.

[`ci-deployment`](ci-deployment)
Infrastructure related work.
