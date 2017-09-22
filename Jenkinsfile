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
    
//Finding if Image already exists
sh 'docker images | grep $JOB_NAME-'+git_branch+' | grep uriwthraj |head -1 | awk \'{print $1}\'>image_name'
sh 'docker images | grep $JOB_NAME-'+git_branch+' | grep uriwthraj |head -1 | awk \'{print $3}\'>image_id'
docker_image_name = readFile 'image_name'
docker_image_id = readFile 'image_id'
String docker_hub
docker_hub = "uriwthraj"   

sh 'docker images | grep $JOB_NAME-'+git_branch+' | head -1| wc -l>flag'
flag_id = readFile 'flag'
echo "PRINTING Value of Flag is ${flag_id}"
int id = Integer.parseInt(flag_id.trim())

if ( id > 0 ) {
  println "Value is greater than ZERO --- $id"
  println "Branch Name is $git_branch"
  println "Job name is $JOB_NAME"
  println "Image id is $docker_image_id"
  println "Image Name is $docker_image_name"
  println "Docker hub details $docker_hub"

  echo "Image Already exists - Deleting old image"
//  docker rmi $docker_image_id -f
  echo "Creating new image"
//  docker build -t $JOB_NAME-$git_branch .
//  docker tag $JOB_NAME-$git_branch $docker_hub/$JOB_NAME-$git_branch
  echo "Pushing Image to Docker hub"
//  docker push $docker_hub/$JOB_NAME-$git_branch
   
}
else {
    echo "VALUE IS ZERO - Flag id value is $id"

    echo "No such image - we can create new one "
    echo "Creating new image"
    docker build -t $JOB_NAME-$git_branch .
    docker tag ${JOB_NAME}-$Branch $docker_hub/$JOB_NAME-$git_branch
    echo "Pushing Image to Docker hub"
    docker push $docker_hub/$JOB_NAME-$git_branch
} 
//Building Docker Image
     sh 'docker build -t $JOB_NAME-'+git_branch+' .'
     sh 'docker tag $JOB_NAME-'+git_branch+' uriwthraj/$JOB_NAME-'+git_branch+''
     echo "Docker image build for this job is ${docker_image_name} and Docker image ID is ${docker_image_id}"
 
// Pushing Docker Image to docker hub
//     sh 'docker tag $JOB_NAME-'+git_branch+' uriwthraj/$JOB_NAME-'+git_branch+''
//     sh 'docker push uriwthraj/$JOB_NAME-'+git_branch+''

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
