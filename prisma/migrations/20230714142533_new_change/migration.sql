-- CreateTable
CREATE TABLE "gl_companies" (
    "company_id" SERIAL NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "closed_flag" BOOLEAN DEFAULT false,

    CONSTRAINT "gl_companies_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "gl_sub_companies" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "sub_company_name" VARCHAR(255) NOT NULL,
    "country_code" VARCHAR(20),
    "city_code" VARCHAR(20),
    "closed_flag" BOOLEAN DEFAULT false,

    CONSTRAINT "gl_sub_companies_pkey" PRIMARY KEY ("company_id","sub_company_id")
);

-- CreateTable
CREATE TABLE "inv_cardex" (
    "company_id" INTEGER,
    "sub_company_id" INTEGER,
    "from_location" VARCHAR(10),
    "to_location" VARCHAR(10),
    "trans_dt" DATE,
    "trans_no" VARCHAR(20),
    "trans_type" VARCHAR(255),
    "serial_no" SERIAL NOT NULL,
    "department_code" VARCHAR(3),
    "product_code" VARCHAR(10),
    "quantity" INTEGER,
    "cost_price" DECIMAL(10,2),
    "username" VARCHAR(255),
    "cardex_id" SERIAL NOT NULL,

    CONSTRAINT "inv_cardex_pkey" PRIMARY KEY ("cardex_id")
);

-- CreateTable
CREATE TABLE "inv_department" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "department_code" VARCHAR(3) NOT NULL,
    "department_name" VARCHAR(255) NOT NULL,
    "closed_flag" BOOLEAN DEFAULT false,
    "created_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255),

    CONSTRAINT "inv_department_pkey" PRIMARY KEY ("company_id","sub_company_id","department_code")
);

-- CreateTable
CREATE TABLE "inv_locations" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "location_code" VARCHAR(10) NOT NULL,
    "location_name" VARCHAR(255),
    "short_name" VARCHAR(50),
    "closed_flag" BOOLEAN DEFAULT false,

    CONSTRAINT "inv_locations_pkey" PRIMARY KEY ("company_id","sub_company_id","location_code")
);

-- CreateTable
CREATE TABLE "inv_product_suppliers" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "supplier_code" VARCHAR(10) NOT NULL,
    "department_code" VARCHAR(10) NOT NULL,
    "product_code" VARCHAR(10) NOT NULL,
    "created_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255),
    "closed_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "inv_product_suppliers_pkey" PRIMARY KEY ("company_id","sub_company_id","supplier_code","department_code","product_code")
);

-- CreateTable
CREATE TABLE "inv_products" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "department_code" VARCHAR NOT NULL,
    "product_code" VARCHAR(10) NOT NULL,
    "product_description" TEXT,
    "qty_instock" INTEGER,
    "qty_purchase" INTEGER,
    "qty_backorder" INTEGER,
    "cost_price" DECIMAL(10,2),
    "closed_flag" BOOLEAN DEFAULT false,
    "created_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255),
    "selling_price" DECIMAL(10,2),

    CONSTRAINT "inv_products_pkey" PRIMARY KEY ("company_id","sub_company_id","department_code","product_code")
);

-- CreateTable
CREATE TABLE "inv_purchase_order" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "order_no" VARCHAR(20) NOT NULL,
    "location_code" VARCHAR(10),
    "order_dt" DATE,
    "supplier_code" VARCHAR(10),
    "eta" DATE,
    "currency" VARCHAR(10),
    "cost_rate" DECIMAL(10,2),
    "supplier_invno" VARCHAR(40),
    "remarks" TEXT,
    "freight" DECIMAL(10,2),
    "order_amount" DECIMAL(10,2),
    "amount_paid" DECIMAL(10,2),
    "non_vendor_cost" DECIMAL(10,2),
    "closed_flag" BOOLEAN DEFAULT false,
    "fulfilled_flag" BOOLEAN DEFAULT false,
    "paid_flag" BOOLEAN DEFAULT false,
    "created_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255),

    CONSTRAINT "inv_purchase_order_pkey" PRIMARY KEY ("company_id","sub_company_id","order_no")
);

-- CreateTable
CREATE TABLE "inv_purchase_order_detail" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "order_no" VARCHAR(20) NOT NULL,
    "serial_no" SERIAL NOT NULL,
    "department_code" VARCHAR(3),
    "product_code" VARCHAR(10),
    "qty_ordered" INTEGER,
    "qty_received" INTEGER,
    "cost_local" DECIMAL(10,2),
    "cost_fc" DECIMAL(10,2),

    CONSTRAINT "inv_purchase_order_detail_pkey" PRIMARY KEY ("company_id","sub_company_id","order_no","serial_no")
);

-- CreateTable
CREATE TABLE "inv_purchase_payment" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "order_no" VARCHAR(20) NOT NULL,
    "payment_no" SERIAL NOT NULL,
    "payment_dt" DATE,
    "remarks" VARCHAR(600),
    "amount" DECIMAL(10,2),
    "created_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255),

    CONSTRAINT "inv_purchase_payment_pkey" PRIMARY KEY ("company_id","sub_company_id","order_no","payment_no")
);

-- CreateTable
CREATE TABLE "inv_stores" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "location_code" VARCHAR(10) NOT NULL,
    "department_code" VARCHAR(3) NOT NULL,
    "product_code" VARCHAR(10) NOT NULL,
    "opening_balance" INTEGER,
    "qty_instock" INTEGER,
    "qty_backorder" INTEGER,
    "qty_purchase" INTEGER,
    "qty_transfer" INTEGER,

    CONSTRAINT "inv_stores_pkey" PRIMARY KEY ("company_id","sub_company_id","location_code","department_code","product_code")
);

-- CreateTable
CREATE TABLE "inv_suppliers" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "supplier_code" VARCHAR(10) NOT NULL,
    "supplier_name" VARCHAR(255) NOT NULL,
    "address_1" VARCHAR(255),
    "address_2" VARCHAR(255),
    "country" VARCHAR(50),
    "telephone_no" VARCHAR(15),
    "mobile_no" VARCHAR(15),
    "email" VARCHAR(255),
    "fax" VARCHAR(40),
    "closed_flag" BOOLEAN DEFAULT false,
    "created_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255),

    CONSTRAINT "inv_suppliers_pkey" PRIMARY KEY ("company_id","sub_company_id","supplier_code")
);

-- CreateTable
CREATE TABLE "inv_transfer" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "from_location" VARCHAR(10) NOT NULL,
    "to_location" VARCHAR(10) NOT NULL,
    "transfer_no" TEXT NOT NULL,
    "transfer_dt" DATE,
    "acknowledge_dt" DATE,
    "received_by" VARCHAR(255),
    "remarks" TEXT,
    "created_by" VARCHAR(255),
    "created_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inv_transfer_pkey" PRIMARY KEY ("company_id","sub_company_id","from_location","to_location","transfer_no")
);

-- CreateTable
CREATE TABLE "inv_transfer_detail" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "transfer_no" TEXT NOT NULL,
    "serial_no" SERIAL NOT NULL,
    "department_code" VARCHAR(3),
    "product_code" VARCHAR(10),
    "qty_transferred" INTEGER,
    "from_location" VARCHAR(10) NOT NULL,
    "to_location" VARCHAR(10) NOT NULL,
    "created_by" VARCHAR(255),
    "created_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inv_transfer_detail_pkey" PRIMARY KEY ("company_id","sub_company_id","from_location","to_location","transfer_no","serial_no")
);

-- CreateTable
CREATE TABLE "inv_transfer_sequences" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "from_location" VARCHAR(10) NOT NULL,
    "to_location" VARCHAR(10) NOT NULL,
    "sequence_number" VARCHAR(200),

    CONSTRAINT "inv_transfer_sequences_pkey" PRIMARY KEY ("company_id","sub_company_id","from_location","to_location")
);

-- CreateTable
CREATE TABLE "sys_programs" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "program_id" SERIAL NOT NULL,
    "program_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "sys_programs_pkey" PRIMARY KEY ("company_id","sub_company_id","program_id")
);

-- CreateTable
CREATE TABLE "sys_roleprograms" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "role_name" VARCHAR(255) NOT NULL,
    "program_id" INTEGER NOT NULL,
    "access" BOOLEAN DEFAULT true,

    CONSTRAINT "sys_roleprograms_pkey" PRIMARY KEY ("company_id","sub_company_id","role_name","program_id")
);

-- CreateTable
CREATE TABLE "sys_roles" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "role_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "sys_roles_pkey" PRIMARY KEY ("company_id","sub_company_id","role_name")
);

-- CreateTable
CREATE TABLE "sys_users" (
    "company_id" INTEGER NOT NULL,
    "sub_company_id" INTEGER NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "verified" BOOLEAN,
    "role_name" VARCHAR(255) NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "sys_users_pkey" PRIMARY KEY ("company_id","sub_company_id","username")
);

-- CreateIndex
CREATE UNIQUE INDEX "gl_companies_company_name_key" ON "gl_companies"("company_name");

-- CreateIndex
CREATE UNIQUE INDEX "gl_sub_companies_sub_company_name_key" ON "gl_sub_companies"("sub_company_name");

-- AddForeignKey
ALTER TABLE "gl_sub_companies" ADD CONSTRAINT "fk_gl_sub_companies_company_id" FOREIGN KEY ("company_id") REFERENCES "gl_companies"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_cardex" ADD CONSTRAINT "inv_cardex_company_id_sub_company_id_department_code_produ_fkey" FOREIGN KEY ("company_id", "sub_company_id", "department_code", "product_code") REFERENCES "inv_products"("company_id", "sub_company_id", "department_code", "product_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_cardex" ADD CONSTRAINT "inv_cardex_company_id_sub_company_id_from_location_fkey" FOREIGN KEY ("company_id", "sub_company_id", "from_location") REFERENCES "inv_locations"("company_id", "sub_company_id", "location_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_cardex" ADD CONSTRAINT "inv_cardex_company_id_sub_company_id_to_location_fkey" FOREIGN KEY ("company_id", "sub_company_id", "to_location") REFERENCES "inv_locations"("company_id", "sub_company_id", "location_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_cardex" ADD CONSTRAINT "inv_cardex_company_id_sub_company_id_username_fkey" FOREIGN KEY ("company_id", "sub_company_id", "username") REFERENCES "sys_users"("company_id", "sub_company_id", "username") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_department" ADD CONSTRAINT "inv_department_company_id_sub_company_id_created_by_fkey" FOREIGN KEY ("company_id", "sub_company_id", "created_by") REFERENCES "sys_users"("company_id", "sub_company_id", "username") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_department" ADD CONSTRAINT "inv_department_company_id_sub_company_id_fkey" FOREIGN KEY ("company_id", "sub_company_id") REFERENCES "gl_sub_companies"("company_id", "sub_company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_locations" ADD CONSTRAINT "inv_locations_company_id_sub_company_id_fkey" FOREIGN KEY ("company_id", "sub_company_id") REFERENCES "gl_sub_companies"("company_id", "sub_company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_product_suppliers" ADD CONSTRAINT "inv_product_suppliers_company_id_sub_company_id_created_by_fkey" FOREIGN KEY ("company_id", "sub_company_id", "created_by") REFERENCES "sys_users"("company_id", "sub_company_id", "username") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_product_suppliers" ADD CONSTRAINT "inv_product_suppliers_company_id_sub_company_id_department_fkey" FOREIGN KEY ("company_id", "sub_company_id", "department_code", "product_code") REFERENCES "inv_products"("company_id", "sub_company_id", "department_code", "product_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_product_suppliers" ADD CONSTRAINT "inv_product_suppliers_company_id_sub_company_id_supplier_c_fkey" FOREIGN KEY ("company_id", "sub_company_id", "supplier_code") REFERENCES "inv_suppliers"("company_id", "sub_company_id", "supplier_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_products" ADD CONSTRAINT "inv_products_company_id_sub_company_id_created_by_fkey" FOREIGN KEY ("company_id", "sub_company_id", "created_by") REFERENCES "sys_users"("company_id", "sub_company_id", "username") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_products" ADD CONSTRAINT "inv_products_company_id_sub_company_id_fkey" FOREIGN KEY ("company_id", "sub_company_id") REFERENCES "gl_sub_companies"("company_id", "sub_company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_purchase_order" ADD CONSTRAINT "inv_purchase_order_company_id_sub_company_id_created_by_fkey" FOREIGN KEY ("company_id", "sub_company_id", "created_by") REFERENCES "sys_users"("company_id", "sub_company_id", "username") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_purchase_order" ADD CONSTRAINT "inv_purchase_order_company_id_sub_company_id_location_code_fkey" FOREIGN KEY ("company_id", "sub_company_id", "location_code") REFERENCES "inv_locations"("company_id", "sub_company_id", "location_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_purchase_order" ADD CONSTRAINT "inv_purchase_order_company_id_sub_company_id_supplier_code_fkey" FOREIGN KEY ("company_id", "sub_company_id", "supplier_code") REFERENCES "inv_suppliers"("company_id", "sub_company_id", "supplier_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_purchase_order_detail" ADD CONSTRAINT "inv_purchase_order_detail_company_id_sub_company_id_depart_fkey" FOREIGN KEY ("company_id", "sub_company_id", "department_code", "product_code") REFERENCES "inv_products"("company_id", "sub_company_id", "department_code", "product_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_purchase_order_detail" ADD CONSTRAINT "inv_purchase_order_detail_company_id_sub_company_id_order__fkey" FOREIGN KEY ("company_id", "sub_company_id", "order_no") REFERENCES "inv_purchase_order"("company_id", "sub_company_id", "order_no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_purchase_payment" ADD CONSTRAINT "inv_purchase_payment_company_id_sub_company_id_created_by_fkey" FOREIGN KEY ("company_id", "sub_company_id", "created_by") REFERENCES "sys_users"("company_id", "sub_company_id", "username") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_purchase_payment" ADD CONSTRAINT "inv_purchase_payment_company_id_sub_company_id_order_no_fkey" FOREIGN KEY ("company_id", "sub_company_id", "order_no") REFERENCES "inv_purchase_order"("company_id", "sub_company_id", "order_no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_stores" ADD CONSTRAINT "inv_stores_company_id_sub_company_id_department_code_produ_fkey" FOREIGN KEY ("company_id", "sub_company_id", "department_code", "product_code") REFERENCES "inv_products"("company_id", "sub_company_id", "department_code", "product_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_stores" ADD CONSTRAINT "inv_stores_company_id_sub_company_id_location_code_fkey" FOREIGN KEY ("company_id", "sub_company_id", "location_code") REFERENCES "inv_locations"("company_id", "sub_company_id", "location_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_suppliers" ADD CONSTRAINT "inv_suppliers_company_id_sub_company_id_created_by_fkey" FOREIGN KEY ("company_id", "sub_company_id", "created_by") REFERENCES "sys_users"("company_id", "sub_company_id", "username") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_suppliers" ADD CONSTRAINT "inv_suppliers_company_id_sub_company_id_fkey" FOREIGN KEY ("company_id", "sub_company_id") REFERENCES "gl_sub_companies"("company_id", "sub_company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_transfer" ADD CONSTRAINT "inv_transfer_company_id_sub_company_id_created_by_fkey" FOREIGN KEY ("company_id", "sub_company_id", "created_by") REFERENCES "sys_users"("company_id", "sub_company_id", "username") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_transfer" ADD CONSTRAINT "inv_transfer_company_id_sub_company_id_from_location_fkey" FOREIGN KEY ("company_id", "sub_company_id", "from_location") REFERENCES "inv_locations"("company_id", "sub_company_id", "location_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_transfer" ADD CONSTRAINT "inv_transfer_company_id_sub_company_id_to_location_fkey" FOREIGN KEY ("company_id", "sub_company_id", "to_location") REFERENCES "inv_locations"("company_id", "sub_company_id", "location_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_transfer_detail" ADD CONSTRAINT "inv_transfer_detail_company_id_sub_company_id_created_by_fkey" FOREIGN KEY ("company_id", "sub_company_id", "created_by") REFERENCES "sys_users"("company_id", "sub_company_id", "username") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_transfer_detail" ADD CONSTRAINT "inv_transfer_detail_company_id_sub_company_id_department_c_fkey" FOREIGN KEY ("company_id", "sub_company_id", "department_code", "product_code") REFERENCES "inv_products"("company_id", "sub_company_id", "department_code", "product_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_transfer_detail" ADD CONSTRAINT "inv_transfer_detail_company_id_sub_company_id_from_locatio_fkey" FOREIGN KEY ("company_id", "sub_company_id", "from_location", "to_location", "transfer_no") REFERENCES "inv_transfer"("company_id", "sub_company_id", "from_location", "to_location", "transfer_no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_transfer_sequences" ADD CONSTRAINT "inv_transfer_sequences_company_id_sub_company_id_from_loca_fkey" FOREIGN KEY ("company_id", "sub_company_id", "from_location") REFERENCES "inv_locations"("company_id", "sub_company_id", "location_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inv_transfer_sequences" ADD CONSTRAINT "inv_transfer_sequences_company_id_sub_company_id_to_locati_fkey" FOREIGN KEY ("company_id", "sub_company_id", "to_location") REFERENCES "inv_locations"("company_id", "sub_company_id", "location_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sys_programs" ADD CONSTRAINT "sys_programs_company_id_sub_company_id_fkey" FOREIGN KEY ("company_id", "sub_company_id") REFERENCES "gl_sub_companies"("company_id", "sub_company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sys_roleprograms" ADD CONSTRAINT "sys_roleprograms_company_id_sub_company_id_program_id_fkey" FOREIGN KEY ("company_id", "sub_company_id", "program_id") REFERENCES "sys_programs"("company_id", "sub_company_id", "program_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sys_roleprograms" ADD CONSTRAINT "sys_roleprograms_company_id_sub_company_id_role_name_fkey" FOREIGN KEY ("company_id", "sub_company_id", "role_name") REFERENCES "sys_roles"("company_id", "sub_company_id", "role_name") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sys_roles" ADD CONSTRAINT "sys_roles_company_id_sub_company_id_fkey" FOREIGN KEY ("company_id", "sub_company_id") REFERENCES "gl_sub_companies"("company_id", "sub_company_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sys_users" ADD CONSTRAINT "sys_users_company_id_sub_company_id_role_name_fkey" FOREIGN KEY ("company_id", "sub_company_id", "role_name") REFERENCES "sys_roles"("company_id", "sub_company_id", "role_name") ON DELETE NO ACTION ON UPDATE NO ACTION;
