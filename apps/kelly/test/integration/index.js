const { ApiGatewayV2, Lambda } = require('aws-sdk');
const { expect } = require('chai');
const axios = require('axios');

describe('Integration tests', () => {
  const environment = process.env.WORKSPACE;

  it('should return a response from the lambda function', async () => {
    const lambda = new Lambda();
    const lambdaFunctionName = `${environment}-kelly`;
    const lambdaPayload = { queryStringParameters: { text: 'hello' } };

    const result = await lambda
      .invoke({
        FunctionName: lambdaFunctionName,
        Payload: Buffer.from(JSON.stringify(lambdaPayload)),
      })
      .promise();

    if (result.FunctionError)
      throw new Error(
        `Invoke of function returned a FunctionError: ${result.FunctionError}`
      );
    if (result instanceof Error)
      throw new Error(
        `'Invoke of function returned an error object:' ${result.errorMessage}`
      );

    expect(result).to.have.property('StatusCode', 200);
    expect(result).to.have.property('Payload');
    const responseBody = JSON.parse(result.Payload.toString());
    expect(responseBody).to.have.property('statusCode', 200);
  }).timeout(10000);

  it('should return a gif response from the lambda function', async () => {
    const lambda = new Lambda();
    const lambdaFunctionName = `${environment}-kelly`;
    const lambdaPayload = {
      queryStringParameters: { text: 'hello', gif: '1' },
    };

    const result = await lambda
      .invoke({
        FunctionName: lambdaFunctionName,
        Payload: Buffer.from(JSON.stringify(lambdaPayload)),
      })
      .promise();

    if (result.FunctionError)
      throw new Error(
        `Invoke of function returned a FunctionError: ${result.FunctionError}`
      );
    if (result instanceof Error)
      throw new Error(
        `'Invoke of function returned an error object:' ${result.errorMessage}`
      );

    expect(result).to.have.property('StatusCode', 200);
    expect(result).to.have.property('Payload');
    const responseBody = JSON.parse(result.Payload.toString());
    expect(responseBody).to.have.property('statusCode', 200);
  }).timeout(10000);

  it('should return a response from the api gateway', async () => {
    const apiGateway = new ApiGatewayV2();
    const apiName = `${environment}-kelly`;
    const apiEndpoint = (await apiGateway.getApis({}).promise()).Items.find(
      ({ Name: name }) => name === apiName
    ).ApiEndpoint;

    const result = await axios.get(
      `${apiEndpoint}/kelly-lambda-stage/?text=hello`
    );

    expect(result).to.have.property('status', 200);
  }).timeout(10000);

  it('should return a response from the cloudflare worker', async () => {
    const url = `https://${environment}.alsmith.dev/kelly/api?text=hello`;

    const result = await axios.get(url);

    expect(result).to.have.property('status', 200);
  }).timeout(10000);
});
