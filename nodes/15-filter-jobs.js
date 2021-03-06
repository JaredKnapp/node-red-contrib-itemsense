/**
 * Created by ralemy on 2/21/16.
 * Node-Red node to get jobs with a specific status
 */
module.exports = function (RED) {
    "use strict";
    var lib = require("./lib/itemsense"),
        _ = require("lodash");

    function RunningJobNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        function sendOutput(config, msg) {
            var copy = _.extend({}, msg),
                mode = config.outputMode;
            if (mode === "array")
                node.send([msg, {
                    topic: "success",
                    payload: "Extracted " + msg.payload.length + " jobs with status " + config.jobStatus,
                    jobStatus: config.jobStatus,
                    count: msg.payload.length
                }]);
            else if (msg.payload.length)
                _.each(msg.payload, function (object, index) {
                    copy.payload = {
                        job: object || {},
                        count: msg.payload.length,
                        index: index + 1
                    };
                    node.send([copy, {
                        topic: "success",
                        payload: "Retracted Job with status " + config.jobStatus,
                        count: msg.payload.length,
                        index: index + 1
                    }]);
                });
            else {
                copy.payload = {
                    job: null,
                    count: 0,
                    index: 0
                };
                node.send([copy, {
                    topic: "success",
                    payload: "No Jobs found with status " + config.jobStatus,
                    count: 0,
                    index: 0
                }]);
            }

        }

        this.on("input", function (msg) {
            var title = `Getting Jobs with status ${config.jobStatus}`,
                itemsense = lib.getItemsense(node, msg, title);
            if (itemsense)
                itemsense.jobs.getAll().then(function (jobs) {
                    msg.topic = "Jobs";
                    msg.payload = config.jobStatus === "ANY" ? jobs : _.filter(jobs, function (job) {
                        return job.status === config.jobStatus;
                    });
                    sendOutput(config, msg);
                    lib.status("exit","", node);
                }).catch(lib.raiseNodeRedError.bind(lib, "Error " + title, msg, node));
        });
    }

    RED.nodes.registerType("filter-jobs", RunningJobNode);
};
