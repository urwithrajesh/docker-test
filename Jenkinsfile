#!groovy
import groovy.json.JsonOutput
import groovy.json.JsonSlurper

// Refer https://gist.github.com/jonico/e205b16cf07451b2f475543cf1541e70
node {
    // pull request or feature branch
    if  (env.BRANCH_NAME != 'master') {
        checkout()
        sonartest()
        junit()
        docker()
        deploy()

        // test whether this is a regular branch build or a merged PR build
        if (!isPRMergeBuild()) {
        }
    }
     // master branch / production
    else {
        checkout()
        sonartest()
        junit()
        build()
        upload()
        approval()
        deploy()
    }
}

def isPRMergeBuild() {
    return (env.BRANCH_NAME ==~ /^PR-\d+$/)
}

// Slack functions 
//Setting up functions to use 
def notifyBuildSlack(String buildStatus, String toChannel) 
    {
        // build status of null means successful
        buildStatus =  buildStatus ?: 'SUCCESSFUL'
        def summary = "${buildStatus}: '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (<${env.BUILD_URL}|Jenkins>)"
        def colorCode = '#FF0000'

        if (buildStatus == 'STARTED' || buildStatus == 'UNSTABLE') {
          colorCode = '#FFFF00' // YELLOW
        } else if (buildStatus == 'SUCCESSFUL') {
          colorCode = '#00FF00' // GREEN
        } else {
          colorCode = '#FF0000' // RED
        }
 
 //def summary = " Dev Job STARTED '${env.JOB_NAME} [${env.BUILD_NUMBER}]. Check Status at (${env.BUILD_URL}console)' "
         // Send slack notifications all messages
    slackSend (baseUrl: 'https://utdigital.slack.com/services/hooks/jenkins-ci/', channel: 'chatops', message: summary , teamDomain: 'utdigital', token: 'a8p3yJ8BdYURLzmorsUyaIaI')
    }

def notifySlackApprovalApplicationOwner(String toChannel) 
    {
    def summary = "Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' is awaiting approval from Application Owner (<${env.BUILD_URL}input/|Jenkins>)"
    def colorCode = '#FF9900' // orange
    slackSend (baseUrl: 'https://utdigital.slack.com/services/hooks/jenkins-ci/', channel: 'chatops', message: summary , teamDomain: 'utdigital', token: 'a8p3yJ8BdYURLzmorsUyaIaI')
    }


def notifyDeploySlack(String buildStatus, String toChannel) 
    {
    // build status of null means successful
    buildStatus =  buildStatus ?: 'SUCCESSFUL'

    def summary = "${buildStatus}: '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (<${env.BUILD_URL}|Jenkins>)"

    def colorCode = '#FF0000'

    if (buildStatus == 'STARTED' || buildStatus == 'UNSTABLE') {
      colorCode = '#FFFF00' // YELLOW
    } else if (buildStatus == 'SUCCESSFUL') {
      colorCode = '#008000' // GREEN
    } else {
      colorCode = '#FF0000' // RED
    }

    // Send slack notifications all messages
    slackSend (baseUrl: 'https://utdigital.slack.com/services/hooks/jenkins-ci/', channel: 'chatops', message: summary , teamDomain: 'utdigital', token: 'a8p3yJ8BdYURLzmorsUyaIaI')
    }

// end of slack functions

//def checkout () {
//    stage 'Checkout code'
//    node {
//        echo 'Building.......'
//        notifyBuildSlack('Starting Prod Job','chatops')
//        checkout([$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'LocalBranch', localBranch: "**"]], submoduleCfg: [], userRemoteConfigs: [[url: 'https://github.com/urwithrajesh/docker-test']]])
//      }
//    }

def checkout () {
    stage 'Checkout code'
    context="continuous-integration/jenkins/"
    context += isPRMergeBuild()?"branch/checkout":"pr-merge/checkout"
    echo "${context}"
    // newer versions of Jenkins do not seem to support setting custom statuses before running the checkout scm step ...
    // setBuildStatus ("${context}", 'Checking out...', 'PENDING')
    checkout scm
    setBuildStatus ("${context}", 'Checking out completed', 'SUCCESS')
}

def sonartest () {
  stage 'SonarQube'
    node {
      echo 'Testing...'
      withSonarQubeEnv('SonarQube') {
        sh ' /var/lib/jenkins/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarQube/bin/sonar-scanner -Dsonar.projectBaseDir=/var/lib/jenkins/workspace/docker-test'
          }
        }
      }

def junit() {
  stage 'Junit'
    node {
      echo 'Starting Junit Testing'
        }
      }

def docker() {
  stage 'Docker Image'
  node {
    echo 'Building Application'
    git url: 'https://github.com/urwithrajesh/docker-test'
    sh 'git rev-parse --abbrev-ref HEAD > GIT_BRANCH'
    git_branch = readFile('GIT_BRANCH').trim()
    echo git_branch
    //sh 'docker build -t $JOB_NAME-git_branch .'
      sh 'docker build -t $JOB_NAME-'+git_branch+' .'
    }
  }

def deploy() {
  stage 'Deploy'
      node {
      echo 'Deploying to server..'
      notifyDeploySlack('Production Job Finished','chatops')
      }
    }

def upload() {
  stage 'Upload'
  node {
      echo 'Updating Yum REPO'
    }
  }

def approval() {
  stage('Approval'){
      notifySlackApprovalApplicationOwner('chatops')
      input "Deploy to prod?"
    }
  }
    
def build () {
    stage 'Build'
    // cache maven artifacts
    shareM2 '/tmp/m2repo'
    mvn 'clean install -DskipTests=true -Dmaven.javadoc.skip=true -Dcheckstyle.skip=true -B -V'
}


//def unitTest() {
//    stage 'Unit tests'
//    mvn 'test -B -Dmaven.javadoc.skip=true -Dcheckstyle.skip=true'
//    step([$class: 'JUnitResultArchiver', testResults: '**/target/surefire-reports/TEST-*.xml'])
//    if (currentBuild.result == "UNSTABLE") {
//        sh "exit 1"
//    }
//}

def getRepoSlug() {
    tokens = "${env.JOB_NAME}".tokenize('/')
    org = tokens[tokens.size()-3]
    repo = tokens[tokens.size()-2]
    return "${org}/${repo}"
}

def getBranch() {
    tokens = "${env.JOB_NAME}".tokenize('/')
    branch = tokens[tokens.size()-1]
    return "${branch}"
}

void setBuildStatus(context, message, state) {
// partially hard coded URL because of https://issues.jenkins-ci.org/browse/JENKINS-36961, adjust to your own GitHub instance
    step([
      echo "inside setBuildStatus function "
      $class: "GitHubCommitStatusSetter",
      contextSource: [$class: "ManuallyEnteredCommitContextSource", context: context],
      errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
      reposSource: [$class: "ManuallyEnteredRepositorySource", url: "https://github.com/${getRepoSlug()}"],
      statusResultSource: [ $class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]] ]
  ]);
}
