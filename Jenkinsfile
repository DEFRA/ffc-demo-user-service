@Library('defra-library@test-isolation')
import uk.gov.defra.ffc.DefraUtils
def defraUtils = new DefraUtils()

def registry = '562955126301.dkr.ecr.eu-west-2.amazonaws.com'
def regCredsId = 'ecr:eu-west-2:ecr-user'
def kubeCredsId = 'awskubeconfig002'
def imageName = 'ffc-demo-user-service'
def repoName = 'ffc-demo-user-service'
def pr = ''
def mergedPrNo = ''
def containerTag = ''

node {
  checkout scm
  try {
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(repoName)
      env.CONTAINER_TAG = containerTag
      sh 'echo containerTag: $CONTAINER_TAG'
      defraUtils.setGithubStatusPending()
    }
    stage('Build test image') {
      defraUtils.buildTestImage(imageName, BUILD_NUMBER)
    }
    stage('Run tests') {
      defraUtils.runTests(imageName, BUILD_NUMBER)
    }
    stage('Push container image') {
      defraUtils.buildAndPushContainerImage(regCredsId, registry, imageName, containerTag)
    }
    if (pr != '') {
      stage('Helm install') {
        withCredentials([
            string(credentialsId: 'postgresExternalNameUserPR', variable: 'postgresExternalName'),
            usernamePassword(credentialsId: 'postgresUserPR', usernameVariable: 'postgresUsername', passwordVariable: 'postgresPassword'),
          ]) {
          def extraCommands = "--values ./helm/ffc-demo-user-service/jenkins-aws.yaml --set postgresExternalName=\"$postgresExternalName\",postgresUsername=\"$postgresUsername\",postgresPassword=\"$postgresPassword\""
          defraUtils.deployChart(kubeCredsId, registry, imageName, containerTag, extraCommands)
        }
      }
    }
    if (pr == '') {
      stage('Publish chart') {
        defraUtils.publishChart(registry, imageName, containerTag)
      }
      stage('Trigger Deployment') {
        withCredentials([
          string(credentialsId: 'JenkinsDeployUrl', variable: 'jenkinsDeployUrl'),
          string(credentialsId: 'ffc-demo-user-service-deploy-token', variable: 'jenkinsToken')
        ]) {
          defraUtils.triggerDeploy(jenkinsDeployUrl, 'ffc-demo-user-service-deploy', jenkinsToken, ['chartVersion':'1.0.0'])
        }
      }
    }
    if (mergedPrNo != '') {
      stage('Remove merged PR') {
        defraUtils.undeployChart(kubeCredsId, imageName, mergedPrNo)
      }
    }
    defraUtils.setGithubStatusSuccess()
  } catch(e) {
    defraUtils.setGithubStatusFailure(e.message)
    throw e
  }
}

