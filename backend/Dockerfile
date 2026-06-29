FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
        libzip-dev \
        libxml2-dev \
        libonig-dev \
        libpq-dev \
        unzip \
    && docker-php-ext-install pdo pdo_pgsql mbstring xml bcmath zip opcache \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

RUN echo '<VirtualHost *:80>\n\tDocumentRoot /var/www/html/public\n\t<Directory /var/www/html/public>\n\t\tAllowOverride All\n\t\tRequire all granted\n\t</Directory>\n</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs \
    && chmod -R 775 storage bootstrap/cache

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data storage bootstrap/cache

RUN chmod +x start.sh

EXPOSE 80

CMD ["./start.sh"]