process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let User = require("../src/model/User");
let SportComplex = require("../src/model/SportComplex")
let server = require("../app");
let { checkAdmin } = require("../src/defaultCheck/checkAdmin");

let chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);
let should = chai.should();
let expect = chai.expect;

let accessToken;

describe("SportComplex", () => {
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
    await SportComplex.deleteMany({});
  });

  describe("Manage SportComplex", () => {
    let facilityId;
    let subId;

    it("should add sport", (done) => {
      let addSportComplex = {
        "name": "testingSportComplex",
      };

      chai
        .request(server)
        .post("/api/sportcomplex/addFacility")
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(addSportComplex)
        .end((err, res) => {
          expect(res).to.have.status(201);
          res.body.should.have.property("name").eql("testingSportComplex");
          facilityId = res.body._id;
          done()
        })
    });

    it("should get sport complex", (done) => {
        chai
          .request(server)
          .get("/api/sportcomplex/getFacility")
          .set({ Authorization: `Bearer ${accessToken}` })
          .end((err, res) => {
            expect(res).to.have.status(200);
            res.body.should.have.property("data")
            res.body.data.should.be.an('array');
            done()
          })
      });

      it("should add sub", (done) => {
        let addSub = {
            "facilityId": facilityId,
            "subCategory": "testSub1"
          };

        chai
          .request(server)
          .patch("/api/sportcomplex/addSub")
          .set({ Authorization: `Bearer ${accessToken}` })
          .send(addSub)
          .end((err, res) => {
            expect(res).to.have.status(201);
            res.body.data.subCategory[0].should.have.property("subName").eql("testSub1")
            subId = res.body.data.subCategory[0]._id
            done()
          })
      });

      it("should delete sub", (done) => {
        let deleteSub = {
            "facilityId": facilityId,
            "subCategoryId": subId
          };

        chai
          .request(server)
          .patch("/api/sportcomplex/deleteSub")
          .set({ Authorization: `Bearer ${accessToken}` })
          .send(deleteSub)
          .end((err, res) => {
            expect(res).to.have.status(201);
            done()
          })
      });
  });
});
