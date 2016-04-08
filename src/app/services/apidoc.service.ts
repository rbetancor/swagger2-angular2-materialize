import {Injectable} from 'angular2/core';
import {Http,Response,Request,RequestOptions,Headers} from 'angular2/http';
import * as EnvConfig from '../utils/env.config';
import {Observable} from 'rxjs/Observable';
import {ApiDefinition} from '../model/api-definition';
import {Observer} from 'rxjs/Observer';
import {PathsObject,DefinitionsObject} from '../model/apidoc';
import {ApiResult} from '../model/api-result';
import {OperationObject} from '../model/api-operation';
import {ParameterObject} from '../model/api-parameter';

const HEADER_CONTENT_TYPE:string = 'Content-Type';
const HEADER_ACCEPT:string = 'Accept';

@Injectable()
export class ApiDocService {
    apiDoc:ApiDefinition;
    constructor(private http:Http) {}
    getApi():Observable<ApiDefinition> {
        if(this.apiDoc) {
            console.log('Getting doc definition from cache');
            return Observable.create((observer:Observer<ApiDefinition>) => {
                return observer.next(this.apiDoc);
            });
        }
        //TODO config
        return this.http.get(EnvConfig.SERVER_ROOT_URL + '/v2/swagger.json').map((res:Response) => {
            this.apiDoc = new ApiDefinition(res.json());
            console.log('Getting doc definition from server');
            return this.apiDoc;
        });
    }
    sendRequest(operation:OperationObject):Observable<ApiResult> {
        let apiResult:ApiResult = new ApiResult();
        console.log(operation);

        let reqOptions:RequestOptions = new RequestOptions();
        reqOptions.method = operation.name;
        reqOptions.url = this.apiDoc.baseUrl+operation.getRequestUrl(false);

        let headers:Headers = new Headers();
        if(operation.consumes && !_.isEmpty(operation.consumes)) {
            if(operation.consumes.length === 1 || !operation.consume.selected) {
                headers.set(HEADER_CONTENT_TYPE, operation.consumes[0]);
            } else {
                headers.set(HEADER_CONTENT_TYPE, operation.consume.selected);
            }
        } else if(operation.consume.selected) {
            headers.set(HEADER_CONTENT_TYPE, operation.consume.selected);
        }
        if(!operation.isDeleteMethod() && operation.produces && !_.isEmpty(operation.produces)) {
            if(operation.produces.length === 1 || !operation.produce.selected) {
                headers.set(HEADER_ACCEPT, operation.produces[0]);
            } else {
                headers.set(HEADER_ACCEPT, operation.produce.selected);
            }
        } else if(operation.produce.selected) {
            headers.set(HEADER_ACCEPT, operation.produce.selected);
        }

        if(operation.isWriteMethod()) {
            if(operation.isConsumeJson()) {
                reqOptions.body = JSON.stringify(operation.originalData);
            }
            if(operation.isConsumeXml()) {
                reqOptions.body = x2js.js2xml(operation.originalData);
            }
            if(operation.isConsumeFormUrlEncoded()) {
                let formBody:string = '';
                operation.parameters.forEach((param:ParameterObject)=> {
                    if(param.isFormParam()) {
                        if(formBody !== '') {
                            formBody += '&';
                        }
                        formBody += param.name+'='+param.value.selected;
                    }
                });
                reqOptions.body = formBody;
            }
            //TODO override HTTP class
            if(operation.isConsumeMultipartFormData()) {
                let boundary:string = '------FormData' + Math.random();
                let body:string = '';
                operation.parameters.forEach((parameter:ParameterObject) => {
                    if(parameter.isFormParam()) {
                        body += '--' + boundary + '\r\n';
                        if(parameter.isTypeFile()) {
                            let file:File = parameter.value.selected.file;
                            body += 'Content-Disposition: form-data; name="'+ parameter.name +'"; filename="'+ file.name +'"\r\n';
                            body += 'Content-Type: '+ file.type +'\r\n\r\n';
                        } else {
                            body += 'Content-Disposition: form-data; name="'+ parameter.name +'";\r\n\r\n';
                            body += parameter.value.selected + '\r\n';
                        }
                    }
                });
                body += '--' + boundary +'--';
                headers.set(HEADER_CONTENT_TYPE,headers.get(HEADER_CONTENT_TYPE)+'; boundary='+boundary);
                reqOptions.body = body;
            }
        }
        reqOptions.headers = headers;
        console.log('Calling api with options',reqOptions);
        return this.http.request(new Request(reqOptions)).map((res:Response) => {
            apiResult.operation = operation;
            apiResult.endDate = new Date();
            try {
                if (operation.isProduceJson()) {
                    apiResult.message = res.json();
                } else {
                    apiResult.message = res.text();
                }
            } catch(error) {
                apiResult.message = res.text();
                if(_.isEmpty(apiResult.message.trim())) {
                    apiResult.message = 'No content';
                }
            }
            apiResult.status = res.status;

            return apiResult;
        });
    }
}