@Library('defra-library@3.0.1')
import uk.gov.defra.ffc.DefraUtils
def defraUtils = new DefraUtils()

def containerSrcFolder = '\\/home\\/node'
def containerTag = ''
def lcovFile = './test-output/lcov.info'
def localSrcFolder = '.'
def mergedPrNo = ''
def pr = ''
def serviceName = 'ffc-demo-user-service'
def sonarQubeEnv = 'SonarQube'
def sonarScanner = 'SonarScanner'
def timeoutInMinutes = 5

node {
  checkout scm
  try {
    stage('Set GitHub status as pending'){
      defraUtils.setGithubStatusPending()
    }
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(serviceName, defraUtils.getPackageJsonVersion())
    }
    stage('Helm lint') {
      defraUtils.lintHelm(serviceName)
    }
    stage('Build test image') {
      defraUtils.buildTestImage(DOCKER_REGISTRY_CREDENTIALS_ID, DOCKER_REGISTRY, serviceName, BUILD_NUMBER)
    }
    stage('Run tests') {
      defraUtils.runTests(serviceName, serviceName, BUILD_NUMBER)
    }
     stage('Create Test Report JUnit'){
      defraUtils.createTestReportJUnit()
    }
    stage('Fix absolute paths in lcov file') {
      defraUtils.replaceInFile(containerSrcFolder, localSrcFolder, lcovFile)
    }
    stage('SonarQube analysis') {
      defraUtils.analyseCode(sonarQubeEnv, sonarScanner, ['sonar.projectKey' : serviceName, 'sonar.sources' : '.'])
    }
    stage("Code quality gate") {
      defraUtils.waitForQualityGateResult(timeoutInMinutes)
    }
    stage('Push container image') {
      defraUtils.buildAndPushContainerImage(DOCKER_REGISTRY_CREDENTIALS_ID, DOCKER_REGISTRY, serviceName, containerTag)
    }
    if (pr != '') {
      stage('Verify version incremented') {
        defraUtils.verifyPackageJsonVersionIncremented()
      }
      stage('Helm install') {
        withCredentials([
          string(credentialsId: 'postgres-external-name-pr', variable: 'postgresExternalName'),
          usernamePassword(credentialsId: 'user-service-postgres-user-pr', usernameVariable: 'postgresUsername', passwordVariable: 'postgresPassword'),
        ]) {
          def helmValues = [
            /container.redeployOnChange="$pr-$BUILD_NUMBER"/,
            /postgresExternalName="$postgresExternalName"/,
            /postgresUsername="$postgresUsername"/,
            /postgresPassword="$postgresPassword"/,
            /labels.version="$containerTag"/
          ].join(',')

          def extraCommands = [
            "--values ./helm/ffc-demo-user-service/jenkins-aws.yaml",
            "--set $helmValues"
          ].join(' ')
          defraUtils.deployChart(KUBE_CREDENTIALS_ID, DOCKER_REGISTRY, serviceName, containerTag, extraCommands)
        }
      }
    }
    if (pr == '') {
      stage('Publish chart') {
        defraUtils.publishChart(DOCKER_REGISTRY, serviceName, containerTag)
      }
      stage('Trigger GitHub release') {
        withCredentials([
          string(credentialsId: 'github-auth-token', variable: 'gitToken')
        ]) {
          defraUtils.triggerRelease(containerTag, serviceName, containerTag, gitToken)
        }
      }
      stage('Trigger Deployment') {
        withCredentials([
          string(credentialsId: 'user-service-deploy-token', variable: 'jenkinsToken'),
          string(credentialsId: 'user-service-job-deploy-name', variable: 'deployJobName')
        ]) {
          defraUtils.triggerDeploy(JENKINS_DEPLOY_SITE_ROOT, deployJobName, jenkinsToken, ['chartVersion': containerTag])
        }
      }
    }
    if (mergedPrNo != '') {
      stage('Remove merged PR') {
        defraUtils.undeployChart(KUBE_CREDENTIALS_ID, serviceName, mergedPrNo)
      }
    }
    stage('Set GitHub status as success'){
      defraUtils.setGithubStatusSuccess()
    }
  } catch(e) {
    defraUtils.setGithubStatusFailure(e.message)
    defraUtils.notifySlackBuildFailure(e.message, "#generalbuildfailures")
    throw e
  } finally {
    defraUtils.deleteTestOutput(serviceName, containerSrcFolder)
  }
}
