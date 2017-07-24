/**
 * Created by ralemy on 7/23/17.
 * decorates instance for functionality not yet implemented.
 */

function addReaderGroups(instance) {
    const makeRequest = instance._itemsenseService.makeRequest.bind(instance._itemsenseService);
    instance.readerGroups = {
        getAll: () => makeRequest(
            {getRequestUrl: () => instance.readerDefinitions.model.path + "/groups"},
            {method: "GET", endPoint: "groups"})
    };
    instance.readerGroups.get = instance.readerGroups.getAll.bind(instance.readerGroups);
}

function addReaderFeatures(instance) {
    const makeRequest = instance._itemsenseService.makeRequest.bind(instance._itemsenseService);
    instance.readerFeatures = {
        configureFeature: (readerDefinitionName, body) => makeRequest(
            {getRequestUrl: () => instance.readerDefinitions.model.path + "/" + readerDefinitionName + "/featureChanges"},
            {method: "POST"},
            body
        ),
        getFeatureStatus: (readerDefinitionName, body) => makeRequest(
            {getRequestUrl: () => instance.readerDefinitions.model.path + "/" + readerDefinitionName + "/featureChanges/" + body.feature},
            {method: "GET"}
        ),
        getActiveFeatureRequestStatus: (readerDefinitionName) => makeRequest(
            {getRequestUrl: () => instance.readerDefinitions.model.path + "/" + readerDefinitionName + "/featureChanges"},
            {method: "GET"}
        )
    }
}

function addThresholdAntennaConfigurations(instance) {
    const makeRequest = instance._itemsenseService.makeRequest.bind(instance._itemsenseService);
    const urlPath = "/configuration/v1/thresholds/antennaConfigurations";

    function makeReplacement(replacement) {
        return (replacement) ? `?replacementId=${replacement}` : "";
    }

    instance.thresholdAntennaConfigurations = {
        get: (id) => makeRequest(
            {getRequestUrl: () => `${urlPath}/${id}`},
            {method: "GET"}
        ),
        getAll: () => makeRequest(
            {getRequestUrl: () => urlPath},
            {method: "GET"}
        ),
        create: (body) => makeRequest(
            {getRequestUrl: () => urlPath},
            {method: "POST"},
            body
        ),
        replace: (body, id) => makeRequest(
            {getRequestUrl: () => `${urlPath}/${id}`},
            {method: "PUT"},
            body
        ),
        delete: (id, replacement) => makeRequest(
            {getRequestUrl: () => `${urlPath}/${id}` + makeReplacement(replacement)},
            {method: "DELETE"}
        )
    }
}

function addThresholdConfigurations(instance) {
    const makeRequest = instance._itemsenseService.makeRequest.bind(instance._itemsenseService);
    const urlPath = "/configuration/v1/thresholds";
    instance.thresholds = {
        get: (id) => makeRequest(
            {getRequestUrl: () => `${urlPath}/${id}`},
            {method: "GET"}
        ),
        getAll: () => makeRequest(
            {getRequestUrl: () => urlPath},
            {method: "GET"}
        ),
        create: (body) => makeRequest(
            {getRequestUrl: () => urlPath},
            {method: "POST"},
            body
        ),
        replace: (body, id) => makeRequest(
            {getRequestUrl: () => `${urlPath}/${id}`},
            {method: "PUT"},
            body
        ),
        delete: (id) => makeRequest(
            {getRequestUrl: () => `${urlPath}/${id}`},
            {method: "DELETE"}
        )
    }
}

function addMessageQueues(instance) {
    const makeRequest = instance._itemsenseService.makeRequest.bind(instance._itemsenseService);
    instance.queueTypes = {
        items: payload => makeRequest(
            {getRequestUrl: () => "/data/v1/items/queues"},
            {method: "PUT"},
            payload
        ),
        transitions: payload => makeRequest(
            {getRequestUrl: () => "/data/v1/items/queues/threshold"},
            {method: "PUT"},
            payload
        ),
        health: payload => makeRequest(
            {getRequestUrl: () => "/health/v1/events/queues"},
            {method: "PUT"},
            payload
        )
    }
}

function makeQueryString(obj){
    let s="";
    for (let i in obj)
        if(obj.hasOwnProperty(i))
            s+=`&${encodeURIComponent(i)}=${encodeURIComponent(obj[i])}`;
    return s.length ? `?${s.substr(1)}`:"";
}

function addTransitionItems (instance){
    const makeRequest = instance._itemsenseService.makeRequest.bind(instance._itemsenseService);
    instance.items.getTransitions=(body)=>makeRequest(
        {getRequestUrl:()=> "/data/v1/items/show/transitions" + makeQueryString(body)},
        {method:"GET"}
    )
}
function decorateInstance(instance) {
    addReaderGroups(instance);
    addReaderFeatures(instance);
    addThresholdConfigurations(instance);
    addThresholdAntennaConfigurations(instance);
    addMessageQueues(instance);
    addTransitionItems(instance);
    return instance;
}

module.exports = function (instance) {
    return decorateInstance(instance);
};