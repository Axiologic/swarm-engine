#!/bin/sh

setup_git() {
  git config --global user.email "psk.build.track@gmail.com"
  git config --global user.name "PSK Build Tracker"
}

commit_test_report() {
  git checkout -b test_reports
  git pull
  git add -f tests/psk-smoke-testing/testReport.html
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

push_to_github() {
  git remote add new_origin https://${GIT_TOKEN}@github.com/privatesky/privatesky > /dev/null 2>&1
  git push -f new_origin test_reports
}

setup_git
commit_test_report
push_to_github