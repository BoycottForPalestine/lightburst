import cron from "node-cron";
import fs from "fs";
import path from "path";
import {
  addActivityIfNotExists,
  getActivityBySourceName,
  updateCronExpression,
} from "../model/activities";

type ActivityCronJob = {
  activityFn: () => void;
  task: cron.ScheduledTask;
};

export const activitiesToCronRegistry: Record<string, ActivityCronJob> = {};

function initializeActivities() {
  const directoryPath = path.join(__dirname);
  fs.readdirSync(directoryPath).forEach((file) => {
    const absolutePath = path.join(directoryPath, file);

    if (fs.statSync(absolutePath).isDirectory()) {
      import(absolutePath).then(async (module) => {
        const sourceName = module.sourceName;
        const fetchData = module.fetchData.toString();
        const cronExpression = module.cronExpression;
        const description = module.description;
        const link = module.link;

        await addActivityIfNotExists(
          sourceName,
          description,
          cronExpression,
          fetchData,
          link
        );

        const activity = await getActivityBySourceName(sourceName);
        if (activity) {
          const task = cron.schedule(
            activity.cronExpression,
            () => {
              module.fetchData();
            },
            {
              runOnInit: true,
            }
          );
          activitiesToCronRegistry[sourceName] = {
            task,
            activityFn: module.fetchData,
          };
        }
      });
    }
  });
}

export const registry = {
  activitiesToCronRegistry,
  initializeActivities,
  updateCronExpression: function (sourceName: string, cronExpression: string) {
    updateCronExpression(sourceName, cronExpression);

    const activity = activitiesToCronRegistry[sourceName];
    if (!activity) {
      // Do nothing silently if cron task for given sourcename does not exist
      return;
    }
    activity.task.stop();

    const newTask = cron.schedule(cronExpression, () => {
      activity.activityFn();
    });
    activitiesToCronRegistry[sourceName] = {
      task: newTask,
      activityFn: activity.activityFn,
    };
  },
};
