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

// ####### Slack functions #################
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
        def summary = "Docker image build for this job is ${docker_image_name} and Docker image ID is ${docker_image_id}"
        slackSend (baseUrl: 'https://utdigital.slack.com/services/hooks/jenkins-ci/', channel: 'chatops', message: summary , teamDomain: 'utdigital', token: 'a8p3yJ8BdYURLzmorsUyaIaI')
    }
def notifyDockerHubSlack() 
    {
        def summary = "To download Docker Image run this command --> docker pull ${docker_image_name}"
        slackSend (baseUrl: 'https://utdigital.slack.com/services/hooks/jenkins-ci/', channel: 'chatops', message: summary , teamDomain: 'utdigital', token: 'a8p3yJ8BdYURLzmorsUyaIaI')
    }

// ################# End of slack functions #################

// ################# Checking out code from GITHUB #################
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

// ################# Calling SonarQube #################
def sonartest () {
  stage 'SonarQube'
    node {
      echo 'Testing...'
      withSonarQubeEnv('SonarQube') {
        sh ' /var/lib/jenkins/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarQube/bin/sonar-scanner -Dsonar.projectBaseDir=/var/lib/jenkins/workspace/docker-test'
          }
        }
      }

// ################# Running Junit Test #################
def junit() {
  stage 'Junit'
    node {
      echo 'Starting Junit Testing'
        }
      }

// ################# Creating DOCKER IMAGES #################
def docker() {
  stage 'Docker Image'
  node {
    echo 'Building Application'
//Finding BRANCH NAME
    git url: 'https://github.com/urwithrajesh/docker-test'
    sh 'git rev-parse --abbrev-ref HEAD > GIT_BRANCH'
    git_branch = readFile('GIT_BRANCH').trim()
    echo git_branch
    echo 'Checking IF IMAGE EXISTS'
    
// Setting up variables
sh 'docker images | grep $JOB_NAME-'+git_branch+' | grep uriwthraj |head -1 | awk \'{print $1}\'>image_name'
sh 'docker images | grep $JOB_NAME-'+git_branch+' | grep uriwthraj |head -1 | awk \'{print $3}\'>image_id'
docker_image_name = readFile 'image_name'
docker_image_id = readFile 'image_id'


sh 'docker images | grep $JOB_NAME-'+git_branch+' | head -1| wc -l>flag'
flag_id = readFile 'flag'
echo "PRINTING Value of Flag is ${flag_id}"
int id = Integer.parseInt(flag_id.trim())

//Finding if Image already exists
if ( id > 0 ) {
  echo "Image Already exists - Deleting old image"
  sh 'docker rmi -f '+docker_image_id+''
  echo "Creating new image"
  sh 'docker build -t $JOB_NAME-'+git_branch+' .'
  sh 'docker tag $JOB_NAME-'+git_branch+' uriwthraj/$JOB_NAME-'+git_branch+''
  //docker tag $JOB_NAME-$git_branch ${docker_hub}/${JOB_NAME}-${git_branch}   
}
else {
    echo "VALUE IS ZERO - Flag id value is $id"

    echo "No such image - we can create new one "
    echo "Creating new image"
    sh 'docker build -t $JOB_NAME-'+git_branch+' .'
    sh 'docker tag $JOB_NAME-'+git_branch+' uriwthraj/$JOB_NAME-'+git_branch+''
} 

sh 'docker images | grep $JOB_NAME-'+git_branch+' | grep uriwthraj |head -1 | awk \'{print $1}\'>image_name'
sh 'docker images | grep $JOB_NAME-'+git_branch+' | grep uriwthraj |head -1 | awk \'{print $3}\'>image_id'
docker_image_name = readFile 'image_name'
docker_image_id = readFile 'image_id'
          
// Sending Image ID on Slack
      notifyDockerSlack()
     }
  }

// ################# Deploy #################
def deploy() {
  stage 'Deploy'
      node {
      echo 'Deploying to server..'
       
// Pushing Docker Image to docker hub
     sh 'docker push uriwthraj/$JOB_NAME-'+git_branch+''
      notifyDockerHubSlack()        
      notifyDeploySlack('Docker Image is uploaded ... Production Job Finished','chatops')
      }
    }
// ################# Upload RPM or Docker Images to Artifacts #################
def upload() {
  stage 'Upload'
  node {
      echo 'Updating Yum REPO'
    }
  }

// ################# Sending message on Slack for Approval #################
def approval() {
  stage('Approval'){
      notifySlackApprovalApplicationOwner('chatops')
      input "Deploy to prod?"
    }
  }
