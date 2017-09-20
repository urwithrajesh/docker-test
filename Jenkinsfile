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
        checkout([$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[url: 'https://github.com/urwithrajesh/testing-pipeline']]])
        }

stage 'SonarQube'
    node {
        echo 'Testing...'
        withSonarQubeEnv('SonarQube') {
          sh ' /var/lib/jenkins/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarQube/bin/sonar-scanner -Dsonar.projectBaseDir=/var/lib/jenkins/workspace/CICD/CICD-Demo-Prod'
            }
    }

stage 'Junit'
  node {
    echo 'Starting Junit Testing'
  }

stage 'Build'
  node {
    echo 'Building Application'
    nodejs('NodeJS') 
      {
        sh '''
        rm -rf /var/lib/jenkins/rpmbuild/SOURCES/*
        mkdir -p nodejsapp-1.0
        rsync -rv * nodejsapp-1.0 
        tar -cvf nodejsapp-1.0.tar.gz nodejsapp-1.0
        cp nodejsapp-1.0.tar.gz /var/lib/jenkins/rpmbuild/SOURCES/ 
        rpmbuild -ba -vv  cicd.spec
        '''
  }
}

stage 'Upload'
node {
    echo 'Updating Yum REPO'
}

stage('Approval'){
    notifySlackApprovalApplicationOwner('chatops')
    input "Deploy to prod?"
}
stage 'Deploy'
    node {
    echo 'Deploying to server..'
    sh '''
        rsync -auv /var/lib/jenkins/workspace/CICD/CICD-Demo-Prod/* /appl/node/
        '''
    notifyDeploySlack('Production Job Finished','chatops')
    }
