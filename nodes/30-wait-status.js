/**
 * Created by ralemy on 2/21/16.
 * Node-Red node to wait for an itemsense job to get to specified status.
 */
module.exports = function (RED) {
    "use strict";
    var lib = require("./lib/itemsense"),
        q = require("q");

    function WaitStatusNode(config) {
        RED.nodes.createNode(this, config);
        var node = this,
            continueChecking = true,
            timer = null;

        function checkJobStatus(opts) {
            return opts.itemsense.jobs.get(opts.jobId).then(function (job) {
                console.log("Job status", opts.jobId, config.jobStatus, job.status, config.interval);
                if (job.status === config.jobStatus)
                    opts.defer.resolve(job);
                else if (job.errors.length)
                    opts.defer.reject({
                        statusCode: 500,
                        message: `Job ${opts.jobId} has errors: ${JSON.stringify(job.errors)}`,
                        job: job
                    });
                else if (continueChecking)
                    setTimeout(function () {
                        checkJobStatus(opts);
                    }, parseInt(config.interval || 1) * 1000);
                else
                    opts.defer.reject({
                        statusCode: 504,
                        message: `Timed out waiting for Job ${opts.jobId} to get to ${config.jobStatus}`,
                        job: job
                    });
            }, function (err) {
                opts.defer.reject(err);
            });
        }

        function waitForStatus(jobId, itemsense) {
            var defer = q.defer();
            setupTimer();
            checkJobStatus({
                jobId: jobId,
                itemsense: itemsense,
                defer: defer
            });
            return defer.promise;
        }

        function setupTimer() {
            continueChecking = true;
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
                continueChecking = false;
            }, parseInt(config.timeout || 1) * 1000);
        }

        this.on("input", function (msg) {
            const title = "Waiting for Status: " + config.jobStatus,
                itemsense = lib.getItemsense(node, msg, title),
                error = "Input message payload does not contain an id property ",
                jobId = msg.payload && msg.payload.id ? msg.payload.id : null;
            if (!jobId)
                lib.raiseNodeRedError(error, msg, node, {message: error});
            else if (itemsense)
                waitForStatus(jobId, itemsense).then(function (job) {
                    lib.status("exit", "", node);
                    msg.topic = "Job";
                    msg.payload = job;
                    node.send([msg, {
                        topic: "Success",
                        payload: "Job " + msg.payload.id + " is now " + config.jobStatus
                    }]);
                }).catch(lib.raiseNodeRedError.bind(lib, "Failed " + title, msg, node));
        });
    }

    RED.nodes.registerType("wait-status", WaitStatusNode);
};
