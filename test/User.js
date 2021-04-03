process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let User = require("../src/model/User");
let server = require("../app");
let { checkAdmin } = require("../src/defaultCheck/checkAdmin");

let chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);
let should = chai.should();

let accessToken;

describe("User", () => {
  before(async () => {
    await checkAdmin();
  });

  after(async () => {
    await User.deleteMany({});
  });

  describe("Login Admin", () => {
    it("should login successfully", (done) => {
      let loginCredentials = {
        username: "admin",
        password: "admin",
      };

      chai
        .request(server)
        .post("/api/auth/loginUser")
        .send(loginCredentials)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("accessToken");
          res.body.should.have.property("refreshToken");
          res.body.should.have.property("status");
          accessToken = res.body.accessToken;
          done();
        });
    });
  });

  describe("Manage User", () => {
    let id;

    it("should create staff", (done) => {
      let createStaff = {
        username: "staff",
        email: "staff@staff.com",
        password: "staff",
      };

      chai
        .request(server)
        .post("/api/user/createUser")
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(createStaff)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property("email").eql("staff@staff.com");
          res.body.should.have.property("role").eql("staff");
          res.body.should.have.property("username").eql("staff");
          res.body.should.have.property("encryptedPassword");
          id = res.body._id;
          done();
        });
    });

    it("should delete staff", (done) => {
      chai
        .request(server)
        .delete(`/api/user/deleteUser/${id}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });
  });
});
