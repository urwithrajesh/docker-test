#!groovy
import groovy.json.JsonOutput
import groovy.json.JsonSlurper

node {
        checkout()
        sonartest()
        junit()
        docker()
        deploy()
}

// Slack functions 
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

def notifyDockerSlack() 
    {
        def summary = "Docker Image id ${docker_image_id}"
        slackSend (baseUrl: 'https://utdigital.slack.com/services/hooks/jenkins-ci/', channel: 'chatops', message: summary , teamDomain: 'utdigital', token: 'a8p3yJ8BdYURLzmorsUyaIaI')
    }
// end of slack functions

def checkout () {
    stage 'Checkout code'
    node {
        echo 'Building.......'
        notifyBuildSlack('Starting Prod Job','chatops')
        checkout([
                $class: 'GitSCM', 
                branches: [[name: '*/master']], 
                doGenerateSubmoduleConfigurations: false, 
                extensions: [[$class: 'LocalBranch', localBranch: "**"]], 
                submoduleCfg: [], 
                userRemoteConfigs: [[url: 'https://github.com/urwithrajesh/docker-test']]
                ])
        }
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
     
      sh 'docker build -t $JOB_NAME-'+git_branch+' .'
      
        sh 'docker images | grep $JOB_NAME-'+git_branch+' | awk \'{print $3}\'>image_id'
        //sh '''docker_image_id=`docker images | grep $JOB_NAME-'+git_branch+' | awk \'{print $3}\'`
        docker_image_id = readFile 'image_id'
        echo "Docker image build for this job is ${docker_image_id}"
        notifyDockerSlack()
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

//def getRepoSlug() {
//    tokens = "${env.JOB_NAME}".tokenize('/')
//    org = tokens[tokens.size()-3]
//    repo = tokens[tokens.size()-2]
//    return "${org}/${repo}"
//}

//def getBranch() {
//    tokens = "${env.JOB_NAME}".tokenize('/')
//    branch = tokens[tokens.size()-1]
//    return "${branch}"
//}
