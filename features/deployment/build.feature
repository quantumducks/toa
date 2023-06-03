Feature: Container Building Options

  Scenario: Building a container with additional RUN
    Given I have a component `dummies.one`
    Given I have a context with:
    """
    registry:
      build:
        run: echo test
    """
    When I export images
    Then the file ./images/*dummies-one*/Dockerfile should contain exact line 'RUN echo test'

  Scenario: Building a container with multiline RUN
    Given I have a component `dummies.one`
    Given I have a context with:
    """
    registry:
      build:
        run: |
          echo test > .test
          rm .test
    """
    When I export images
    Then the file ./images/*dummies-one*/Dockerfile should contain exact line 'RUN echo test > .test'
    And the file ./images/*dummies-one*/Dockerfile should contain exact line 'RUN rm .test'

  Scenario: Building a container with arguments
    Given I have a component `dummies.one`
    Given I have a context with:
    """
    registry:
      build:
        arguments: [FOO, BAR]
    """
    When I export images
    Then the file ./images/*dummies-one*/Dockerfile should contain exact line 'ARG FOO'
    Then the file ./images/*dummies-one*/Dockerfile should contain exact line 'ENV FOO=$FOO'
    Then the file ./images/*dummies-one*/Dockerfile should contain exact line 'ARG FOO'
    Then the file ./images/*dummies-one*/Dockerfile should contain exact line 'ARG FOO'

  Scenario: Building a container with custom npm registry
    Given I have a component `dummies.one`
    Given I have a context with:
    """
    runtime:
      registry: http://host.docker.internal:4873
    """
    When I export images
    Then the file ./images/*dummies-one*/Dockerfile should contain exact line 'RUN if [ "http://host.docker.internal:4873" != "" ]; then npm set registry http://host.docker.internal:4873; fi'

  Scenario: Building a container with custom npm proxy
    Given I have a component `dummies.one`
    Given I have a context with:
    """
    runtime:
      proxy: http://host.docker.internal:4873
    """
    When I export images
    Then the file ./images/*dummies-one*/Dockerfile should contain exact line 'RUN if [ "http://host.docker.internal:4873" != "" ]; then npm set proxy http://host.docker.internal:4873; fi'

