CREATE TABLE "user_list" (
	"email" varchar NOT NULL,
	"qb" integer,
	"rb1" integer,
	"rb2" integer,
	"wr1" integer,
	"wr2" integer,
	"te" integer,
	"flex1" integer,
	"flex2" integer,
	"flex3" integer,
	"flex4" integer,
	"k" integer,
	"dst" integer,
	"total1"  DECIMAL(10, 2) DEFAULT 0,
	"total2"  DECIMAL(10, 2) DEFAULT 0,
	"total3"  DECIMAL(10, 2) DEFAULT 0,
	"total4"  DECIMAL(10, 2) DEFAULT 0,
	"grand_total"  DECIMAL(10, 2) DEFAULT 0;
	CONSTRAINT "user_list_pk" PRIMARY KEY ("email")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "player_list" (
	"player_id" integer NOT NULL,
	"player_name" varchar,
	"position" varchar,
	"nfl_team" varchar,
	"pass_yd1" integer,
	"pass_td1" integer,
	"interception1" integer,
	"rush_yd1" integer,
	"rush_td1" integer,
	"rec_yd1" integer,
	"rec_td1" integer,
	"rec1" integer,
	"te_rec1" integer,
	"two_pt1" integer,
	"fg301" integer,
	"fg401" integer,
	"fg501" integer,
	"xtpm1" integer,
	"pass_yd2" integer,
	"pass_td2" integer,
	"interception2" integer,
	"rush_yd2" integer,
	"rec_yd2" integer,
	"rush_td2" integer,
	"rec_td2" integer,
	"rec2" integer,
	"te_rec2" integer,
	"two_pt2" integer,
	"fg302" integer,
	"fg402" integer,
	"fg502" integer,
	"xtpm2" integer,
	"pass_yd3" integer,
	"pass_td3" integer,
	"interception3" integer,
	"rush_yd3" integer,
	"rush_td3" integer,
	"rec_yd3" integer,
	"rec_td3" integer,
	"rec3" integer,
	"te_rec3" integer,
	"two_pt3" integer,
	"fg303" integer,
	"fg403" integer,
	"fg503" integer,
	"xtpm3" integer,
	"pass_yd4" integer,
	"pass_td4" integer,
	"interception4" integer,
	"rush_yd4" integer,
	"rush_td4" integer,
	"rec_yd4" integer,
	"rec_td4" integer,
	"rec4" integer,
	"te_rec4" integer,
	"two_pt4" integer,
	"fg304" integer,
	"fg404" integer,
	"fg504" integer,
	"xtpm4" integer,
	"points1" decimal,
	"points2" decimal,
	"points3" decimal,
	"points4" decimal,
	CONSTRAINT "player_list_pk" PRIMARY KEY ("player_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "def_list" (
	"def_id" integer NOT NULL,
	"nfl_team" varchar,
	"sack1" integer,
	"turnover1" integer,
	"block_ret1" integer,
	"sfty1" integer,
	"td1" integer,
	"pts_allowed1" integer,
	"sack2" integer,
	"turnover2" integer,
	"block_ret2" integer,
	"sfty2" integer,
	"td2" integer,
	"pts_allowed2" integer,
	"sack3" integer,
	"turnover3" integer,
	"block_ret3" integer,
	"sack4" integer,
	"td3" integer,
	"sfty3" integer,
	"pts_allowed3" integer,
	"turnover4" integer,
	"block_ret4" integer,
	"sfty4" integer,
	"td4" integer,
	"pts_allowed4" integer,
	CONSTRAINT "def_list_pk" PRIMARY KEY ("def_id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "eliminated_teams" (
    "team_id" integer not null,
    "nfl_team" VARCHAR NOT NULL,
    "eliminated" BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT "eliminated_teams_pk" PRIMARY KEY ("team_id")
);


ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk0" FOREIGN KEY ("qb") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk1" FOREIGN KEY ("rb1") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk2" FOREIGN KEY ("rb2") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk3" FOREIGN KEY ("wr1") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk4" FOREIGN KEY ("wr2") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk5" FOREIGN KEY ("te") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk6" FOREIGN KEY ("flex1") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk7" FOREIGN KEY ("flex2") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk8" FOREIGN KEY ("flex3") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk9" FOREIGN KEY ("flex4") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk10" FOREIGN KEY ("k") REFERENCES "player_list"("player_id");
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_fk11" FOREIGN KEY ("dst") REFERENCES "def_list"("def_id");

ALTER TABLE "player_list" ADD CONSTRAINT "player_list_fk0" FOREIGN KEY ("player_id") REFERENCES "player_list"("_id");

ALTER TABLE "def_list" ADD CONSTRAINT "def_list_fk0" FOREIGN KEY ("def_id") REFERENCES "def_list"("_id");

ALTER TABLE user_list
ADD COLUMN grand_total DECIMAL GENERATED ALWAYS AS (
  COALESCE(total1, 0) + COALESCE(total2, 0) + COALESCE(total3, 0) + COALESCE(total4, 0)
) STORED;