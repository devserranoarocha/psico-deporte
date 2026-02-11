<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260210080259 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

   public function up(Schema $schema): void
    {
        // 1. Añade la columna permitiendo nulos primero
        $this->addSql('ALTER TABLE news ADD title VARCHAR(255) DEFAULT NULL');
        
        // 2. RELLENA los datos antiguos con un texto genérico
        $this->addSql("UPDATE news SET title = 'Noticia antigua sin título' WHERE title IS NULL");
        
        // 3. Ahora ponemos la restricción de que no puede ser nulo
        $this->addSql('ALTER TABLE news ALTER COLUMN title SET NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE news DROP title
        SQL);
    }
}
