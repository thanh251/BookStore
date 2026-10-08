CREATE DATABASE IF NOT EXISTS bookstore
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bookstore;

CREATE TABLE IF NOT EXISTS `user` (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(25) NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phoneNumber VARCHAR(32) NOT NULL,
  gender BIT(1) NOT NULL DEFAULT b'0',
  address VARCHAR(500) NOT NULL,
  role ENUM('ADMIN', 'EMPLOYEE', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_username (username),
  UNIQUE KEY uq_user_email (email),
  UNIQUE KEY uq_user_phone_number (phoneNumber)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS category (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  imageName VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_category_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12,2) UNSIGNED NOT NULL,
  discount DECIMAL(5,2) UNSIGNED NOT NULL DEFAULT 0,
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  totalBuy INT UNSIGNED NOT NULL DEFAULT 0,
  author VARCHAR(255) NOT NULL,
  pages INT UNSIGNED NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  yearPublishing SMALLINT UNSIGNED NOT NULL,
  description TEXT NULL,
  imageName VARCHAR(255) NULL,
  shop BIT(1) NOT NULL DEFAULT b'1',
  startsAt DATETIME NULL,
  endsAt DATETIME NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_shop_created_at (shop, createdAt),
  KEY idx_product_shop_total_buy (shop, totalBuy),
  KEY idx_product_name (name),
  CONSTRAINT chk_product_discount CHECK (discount <= 100),
  CONSTRAINT chk_product_pages CHECK (pages > 0),
  CONSTRAINT chk_product_year CHECK (yearPublishing BETWEEN 1000 AND 9999),
  CONSTRAINT chk_product_promotion_dates CHECK (
    startsAt IS NULL OR endsAt IS NULL OR startsAt <= endsAt
  )
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_category (
  productId INT UNSIGNED NOT NULL,
  categoryId INT UNSIGNED NOT NULL,
  PRIMARY KEY (productId, categoryId),
  KEY idx_product_category_category (categoryId, productId),
  CONSTRAINT fk_product_category_product
    FOREIGN KEY (productId) REFERENCES product (id) ON DELETE CASCADE,
  CONSTRAINT fk_product_category_category
    FOREIGN KEY (categoryId) REFERENCES category (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  userId INT UNSIGNED NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_user (userId),
  CONSTRAINT fk_cart_user
    FOREIGN KEY (userId) REFERENCES `user` (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_item (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cartId INT UNSIGNED NOT NULL,
  productId INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_item_product (cartId, productId),
  KEY idx_cart_item_product (productId),
  CONSTRAINT fk_cart_item_cart
    FOREIGN KEY (cartId) REFERENCES cart (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_item_product
    FOREIGN KEY (productId) REFERENCES product (id) ON DELETE CASCADE,
  CONSTRAINT chk_cart_item_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  userId INT UNSIGNED NOT NULL,
  status TINYINT UNSIGNED NOT NULL DEFAULT 1,
  deliveryMethod TINYINT UNSIGNED NOT NULL,
  deliveryPrice DECIMAL(12,2) UNSIGNED NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_user_created_at (userId, createdAt),
  KEY idx_orders_status_created_at (status, createdAt),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (userId) REFERENCES `user` (id) ON DELETE RESTRICT,
  CONSTRAINT chk_orders_status CHECK (status BETWEEN 1 AND 3),
  CONSTRAINT chk_orders_delivery_method CHECK (deliveryMethod IN (1, 2))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_item (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  orderId INT UNSIGNED NOT NULL,
  productId INT UNSIGNED NOT NULL,
  price DECIMAL(12,2) UNSIGNED NOT NULL,
  discount DECIMAL(5,2) UNSIGNED NOT NULL DEFAULT 0,
  quantity INT UNSIGNED NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_item_order (orderId),
  KEY idx_order_item_product (productId),
  CONSTRAINT fk_order_item_order
    FOREIGN KEY (orderId) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_item_product
    FOREIGN KEY (productId) REFERENCES product (id) ON DELETE RESTRICT,
  CONSTRAINT chk_order_item_discount CHECK (discount <= 100),
  CONSTRAINT chk_order_item_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_review (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  userId INT UNSIGNED NOT NULL,
  productId INT UNSIGNED NOT NULL,
  ratingScore TINYINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  isShow BIT(1) NOT NULL DEFAULT b'1',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_review_user_product (userId, productId),
  KEY idx_product_review_product_created_at (productId, createdAt),
  CONSTRAINT fk_product_review_user
    FOREIGN KEY (userId) REFERENCES `user` (id) ON DELETE CASCADE,
  CONSTRAINT fk_product_review_product
    FOREIGN KEY (productId) REFERENCES product (id) ON DELETE CASCADE,
  CONSTRAINT chk_product_review_rating CHECK (ratingScore BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wishlist_item (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  userId INT UNSIGNED NOT NULL,
  productId INT UNSIGNED NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlist_item_user_product (userId, productId),
  KEY idx_wishlist_item_product (productId),
  CONSTRAINT fk_wishlist_item_user
    FOREIGN KEY (userId) REFERENCES `user` (id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_item_product
    FOREIGN KEY (productId) REFERENCES product (id) ON DELETE CASCADE
) ENGINE=InnoDB;
