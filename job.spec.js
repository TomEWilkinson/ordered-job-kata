const expect = require('chai').expect;
const OrderJobsCommand = require('./job');

describe('OrderJobsCommand', () => {

  let order = (jobs) => OrderJobsCommand.create(jobs).execute();

  describe('#execute', () => {

    it('should return empty string for empty input', () => {
      expect(order('')).to.eql('');
    });

    it('should get the job if a single job is given', () => {
      expect(order('a =>')).to.eql('a');
      expect(order('b =>')).to.eql('b');
    });

    it('should get all of the jobs in no significant order if multiple jobs are given', () => {
      let jobs = order('a =>\nb =>\nc =>');
      expect(jobs).to.have.lengthOf(3);
      expect(jobs).to.contain('a');
      expect(jobs).to.contain('b');
      expect(jobs).to.contain('c');
    });

    it('should place a job after it\'s dependency', () => {
      let jobs = order('a =>\nb => c\nc =>');
      expect(jobs).to.have.lengthOf(3);
      expect(jobs).to.contain('a');
      expect(jobs.indexOf('c')).to.below(jobs.indexOf('b'));
    });

    it('should place jobs after the same dependency', () => {
      let jobs = order('a =>c \nb => c\nc =>');
      expect(jobs).to.have.lengthOf(3);
      expect(jobs.indexOf('c')).to.below(jobs.indexOf('b'));
      expect(jobs.indexOf('c')).to.below(jobs.indexOf('a'));
    });

    it('should handle multiple dependencies', () => {
      let jobs = order('a =>\nb => c\nc => f\nd => a\ne => b\nf =>');
      expect(jobs).to.have.lengthOf(6);
      expect(jobs.indexOf('f')).to.below(jobs.indexOf('c'));
      expect(jobs.indexOf('a')).to.below(jobs.indexOf('d'));
      expect(jobs.indexOf('b')).to.below(jobs.indexOf('e'));
    });

  });

});
