const JOB_SEPARATOR = '=>';
const MULTIPLE_JOBS_SEPARATOR = '\n';

class OrderJobsCommand {
  constructor(expression) {
    this._expression = expression || '';
  }

  execute() {
    return JobRepository.fromExpression(this._expression)
      .sortByDependency()
      .getNames()
      .join('');
  }

  static create(expression) {
    return new OrderJobsCommand(expression);
  }
}



class JobRepository {
  constructor(jobs = []) {
    this._jobs = jobs;
  }

  getNames() {
    return this._jobs.map((job) => job.name);
  }

  has(job) {
    return Boolean(this.getByName(job.name));
  }

  getByName(name) {
    return this._jobs.find((job) => job.name === name);
  }

  add(job) {
    if (!this.has(job)) this._jobs.push(job);
  }

  addBefore(job, before) {
    if (!this.has(job)) {
      let beforeIndex = this._jobs.indexOf(before);
      this._jobs.splice(beforeIndex, 0, job);
    }
  }

  sortByDependency() {
    let orderedJobs = new JobRepository();

    this._jobs.forEach((job) => {
      orderedJobs.add(job);

      if (job.hasDependency()) {
        orderedJobs.addBefore(this.getByName(job.dependency), job);
      }
    });

    return orderedJobs;
  }

  static fromExpression(expression) {
    let jobs = expression.split(MULTIPLE_JOBS_SEPARATOR).map(Job.fromExpression);
    return new JobRepository(jobs);
  }
}



class Job {

  constructor({ name, dependency }) {
    this.name = name;
    this.dependency = dependency;
  }

  hasDependency() {
    return Boolean(this.dependency);
  }

  static fromExpression(expression) {
    return new Job({
      name: Job._fetchNameFromExpression(expression),
      dependency: Job._fetchDependencyFromExpression(expression)
    });
  }

  static _fetchNameFromExpression(expression) {
    return expression.split(JOB_SEPARATOR)[0].trim();
  }

  static _fetchDependencyFromExpression(expression) {
    let dependency = expression.split(JOB_SEPARATOR)[1] || '';
    return dependency.trim();
  }
}

module.exports = OrderJobsCommand;
