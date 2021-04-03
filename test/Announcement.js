process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let User = require("../src/model/User");
let Announcement = require("../src/model/Announcement")
let server = require("../app");
let { checkAdmin } = require("../src/defaultCheck/checkAdmin");

let chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);
let should = chai.should();
let expect = chai.expect;

let accessToken;

describe("Announcement", () => {
  before(async () => {
    await checkAdmin();

    let loginCredentials = {
        username: "admin",
        password: "admin",
      };

      await chai
        .request(server)
        .post("/api/auth/loginUser")
        .send(loginCredentials)
        .then((res) => {
          accessToken = res.body.accessToken;
        })
        .catch((err) => {
            console.log(err)
          });
  });

  after(async () => {
    await User.deleteMany({});
    await Announcement.deleteMany({});
  });

  describe("Manage Announcement", () => {
    let id;

    it("should post announcement", (done) => {
      let postannouncement = {
        "title": "testing",
        "announcement": "testing",
      };

      chai
        .request(server)
        .post("/api/announcement/postannouncement")
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(postannouncement)
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.have.property("title").eql("testing");
          res.body.should.have.property("announcement").eql("testing");
          id = res.body._id;
          done()
        })
    });

    it("should delete announcement", (done) => {
        chai
          .request(server)
          .delete(`/api/announcement/deleteannouncement/${id}`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .end((err, res) => {
            expect(res).to.have.status(204);
            done()
          })
      });
  });
});
