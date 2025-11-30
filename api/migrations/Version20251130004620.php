<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251130004620 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE question ADD questionnaire_id INT NOT NULL');
        $this->addSql('ALTER TABLE question ADD CONSTRAINT FK_B6F7494ECE07E8FF FOREIGN KEY (questionnaire_id) REFERENCES questionnaire (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_B6F7494ECE07E8FF ON question (questionnaire_id)');
        $this->addSql('ALTER TABLE questionnaire DROP CONSTRAINT fk_7a64daf4450e60b');
        $this->addSql('ALTER TABLE questionnaire ADD CONSTRAINT FK_7A64DAF4450E60B FOREIGN KEY (start_question_id) REFERENCES question (id) ON DELETE SET NULL NOT DEFERRABLE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE question DROP CONSTRAINT FK_B6F7494ECE07E8FF');
        $this->addSql('DROP INDEX IDX_B6F7494ECE07E8FF');
        $this->addSql('ALTER TABLE question DROP questionnaire_id');
        $this->addSql('ALTER TABLE questionnaire DROP CONSTRAINT FK_7A64DAF4450E60B');
        $this->addSql('ALTER TABLE questionnaire ADD CONSTRAINT fk_7a64daf4450e60b FOREIGN KEY (start_question_id) REFERENCES question (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
