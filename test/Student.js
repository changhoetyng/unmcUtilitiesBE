process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let Student = require("../src/model/Student");
let server = require("../app");

let chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);
let should = chai.should();
let expect = chai.expect;

let accessToken;

describe("Student", () => {
  after(async () => {
    await Student.deleteMany({});
  });

  describe("Manage Student", () => {
    let studentInfo = {
      studentId: "12345678",
      email: "test@test.com",
      password: "test",
    };
    it("student should be able to signup", (done) => {
      chai
        .request(server)
        .post("/api/student/signup")
        .send(studentInfo)
        .end((err, res) => {
          expect(res).to.have.status(201);
          res.body.should.have.property("studentId").eql(studentInfo.studentId);
          res.body.should.have.property("email").eql(studentInfo.email);
          done();
        });
    });
    it("student should be able to login", (done) => {
      chai
        .request(server)
        .post("/api/student/login")
        .send(studentInfo)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("accessToken");
          res.body.should.have.property("refreshToken");
          res.body.should.have.property("status");
          accessToken = res.body.accessToken;
          done();
        });
    });
    it("student should be able to get their information", (done) => {
        chai
          .request(server)
          .get("/api/student/getUser")
          .set({ Authorization: `Bearer ${accessToken}` })
          .send(studentInfo)
          .end((err, res) => {
            res.body.user.should.have.property("studentId").eql(studentInfo.studentId);
            res.body.user.should.have.property("email").eql(studentInfo.email);
            done();
          });
      });
  });
});
