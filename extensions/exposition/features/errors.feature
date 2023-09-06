Feature: Errors

  Scenario Outline: Missing routes
    Given the `greeter` is running with the following manifest:
      """yaml
      namespace: basic
      """
    When the following request is received:
      """
      GET <path> HTTP/1.1
      accept: application/yaml
      """
    Then the following reply is sent:
      """
      404 Not Found
      """
    Examples:
      | path                                 |
      | /basic/greeter/non-existent-segment/ |
      | /basic/non-existent-component/       |
      | /non-existent-namespace/             |

  Scenario: Missing trailing slash
    Given the `greeter` is running with the following manifest:
      """yaml
      namespace: basic
      """
    When the following request is received:
      """
      GET /basic/greeter HTTP/1.1
      accept: application/json
      """
    Then the following reply is sent:
      """
      404 Not Found
      content-type: application/json

      "Trailing slash is required."
      """

  Scenario: Missing method
    Given the `greeter` is running
    When the following request is received:
      """
      PATCH /greeter/ HTTP/1.1
      accept: application/yaml
      """
    Then the following reply is sent:
      """http
      405 Method Not Allowed
      """

  Scenario: Unsupported method
    When the following request is received:
      """
      COPY /basic/greeter/ HTTP/1.1
      accept: application/yaml
      """
    Then the following reply is sent:
      """http
      501 Not Implemented
      """

  Scenario: Request body does not match input schema
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:
          POST: transit
      """
    When the following request is received:
      """
      POST /pots/ HTTP/1.1
      accept: application/yaml
      content-type: application/yaml

      foo: Hello
      bar: 1.5
      """
    Then the following reply is sent:
      """
      400 Bad Request
      content-type: application/yaml

      must have required property 'title'
      """

  Scenario: Query limit out of range
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:
          GET: enumerate
      """
    When the following request is received:
      """
      GET /pots/?limit=1001 HTTP/1.1
      accept: text/plain
      """
    Then the following reply is sent:
      """
      400 Bad Request
      content-type: text/plain

      Query limit must be between 1 and 1000 inclusive.
      """

  Scenario: Closed query criteria
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /hot:
          GET:
            endpoint: enumerate
            query:
              criteria: temerature>60
      """
    When the following request is received:
      """
      GET /pots/hot/?criteria=volume>500 HTTP/1.1
      accept: text/plain
      """
    Then the following reply is sent:
      """
      400 Bad Request
      content-type: text/plain

      Query criteria is closed.
      """

  Scenario: Additional query parameters
    Given the `pots` is running with the following manifest:
      """yaml
      exposition:
        /:
          GET:
            endpoint: enumerate
      """
    When the following request is received:
      """
      GET /pots/?foo=bar HTTP/1.1
      accept: text/plain
      """
    Then the following reply is sent:
      """
      400 Bad Request
      content-type: text/plain

      Query must NOT have additional properties
      """

  Scenario: Malformed authorization header
    Given the annotation:
      """yaml
      /:
        GET: {}
      """
    When the following request is received:
      """
      GET / HTTP/1.1
      authorization: Basic
      accept: text/plain
      """
    Then the following reply is sent:
      """
      401 Unauthorized

      Malformed authorization header.
      """

  Scenario: Creating an Identity using inception with existing credentials
    Given the `identity.basic` database is empty
    And the `users` is running with the following manifest:
      """yaml
      exposition:
        /:
          anonymous: true
          POST:
            incept: id
            endpoint: transit
      """
    When the following request is received:
      # identity inception
      """
      POST /users/ HTTP/1.1
      authorization: Basic dXNlcjpwYXNzMTIzNA==
      accept: application/yaml
      content-type: application/yaml

      name: Bill Smith
      """
    And the following request is received:
      # same credentials
      """
      POST /users/ HTTP/1.1
      authorization: Basic dXNlcjpwYXNzMTIzNA==
      content-type: text/plain

      name: Mary Louis
      """
    Then the following reply is sent:
      """
      403 Forbidden
      """
