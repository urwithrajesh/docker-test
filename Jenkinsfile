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

// Starting Pipeline
stage 'Download'
    node {
        echo 'Building.......'
        notifyBuildSlack('Starting Prod Job','chatops')
        //checkout([$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[url: 'https://github.com/urwithrajesh/docker-test']]])
        checkout([$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'LocalBranch', localBranch: "**"]], submoduleCfg: [], userRemoteConfigs: [[url: 'https://github.com/urwithrajesh/docker-test']]])
}

stage 'SonarQube'
    node {
        echo 'Testing...'
        withSonarQubeEnv('SonarQube') {
          sh ' /var/lib/jenkins/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarQube/bin/sonar-scanner -Dsonar.projectBaseDir=/var/lib/jenkins/workspace/docker-test'
            }
    }

stage 'Junit'
  node {
    echo 'Starting Junit Testing'
  }

stage 'Docker Image'
  node {
    echo 'Building Application'
    git url: 'https://github.com/urwithrajesh/docker-test'
    sh 'git rev-parse --abbrev-ref HEAD > GIT_BRANCH'
    git_branch = readFile('GIT_BRANCH').trim()
    echo git_branch
    //sh 'docker build -t $JOB_NAME-git_branch .'
      sh 'echo $BRANCH_NAME'
}


stage 'Deploy'
    node {
    echo 'Deploying to server..'
    notifyDeploySlack('Production Job Finished','chatops')
    }
