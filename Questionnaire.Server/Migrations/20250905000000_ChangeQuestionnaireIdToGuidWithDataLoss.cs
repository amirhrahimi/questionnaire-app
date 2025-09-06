using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Questionnaire.Server.Migrations
{
    /// <inheritdoc />
    public partial class ChangeQuestionnaireIdToGuidWithDataLoss : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop foreign key constraints first
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Questionnaires_QuestionnaireId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_QuestionnaireResponses_Questionnaires_QuestionnaireId",
                table: "QuestionnaireResponses");

            // Drop all existing data to avoid casting issues
            migrationBuilder.Sql("TRUNCATE TABLE \"Responses\" CASCADE;");
            migrationBuilder.Sql("TRUNCATE TABLE \"QuestionOptions\" CASCADE;");
            migrationBuilder.Sql("TRUNCATE TABLE \"Questions\" CASCADE;");
            migrationBuilder.Sql("TRUNCATE TABLE \"QuestionnaireResponses\" CASCADE;");
            migrationBuilder.Sql("TRUNCATE TABLE \"Questionnaires\" CASCADE;");

            // Drop the primary key constraint
            migrationBuilder.Sql("ALTER TABLE \"Questionnaires\" DROP CONSTRAINT \"PK_Questionnaires\";");

            // Drop the old Id column entirely
            migrationBuilder.DropColumn(
                name: "Id",
                table: "Questionnaires");

            // Add the new Id column as UUID
            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "Questionnaires",
                type: "uuid",
                nullable: false);

            // Recreate the primary key constraint
            migrationBuilder.AddPrimaryKey(
                name: "PK_Questionnaires",
                table: "Questionnaires",
                column: "Id");

            // Change the foreign key column types using drop/recreate approach
            
            // Handle QuestionnaireResponses.QuestionnaireId
            migrationBuilder.DropColumn(
                name: "QuestionnaireId",
                table: "QuestionnaireResponses");

            migrationBuilder.AddColumn<Guid>(
                name: "QuestionnaireId",
                table: "QuestionnaireResponses",
                type: "uuid",
                nullable: false);

            // Handle Questions.QuestionnaireId
            migrationBuilder.DropColumn(
                name: "QuestionnaireId",
                table: "Questions");

            migrationBuilder.AddColumn<Guid>(
                name: "QuestionnaireId",
                table: "Questions",
                type: "uuid",
                nullable: false);

            // Recreate foreign key constraints
            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Questionnaires_QuestionnaireId",
                table: "Questions",
                column: "QuestionnaireId",
                principalTable: "Questionnaires",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionnaireResponses_Questionnaires_QuestionnaireId",
                table: "QuestionnaireResponses",
                column: "QuestionnaireId",
                principalTable: "Questionnaires",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop foreign key constraints first
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Questionnaires_QuestionnaireId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_QuestionnaireResponses_Questionnaires_QuestionnaireId",
                table: "QuestionnaireResponses");

            // Drop all existing data
            migrationBuilder.Sql("TRUNCATE TABLE \"Responses\" CASCADE;");
            migrationBuilder.Sql("TRUNCATE TABLE \"QuestionOptions\" CASCADE;");
            migrationBuilder.Sql("TRUNCATE TABLE \"Questions\" CASCADE;");
            migrationBuilder.Sql("TRUNCATE TABLE \"QuestionnaireResponses\" CASCADE;");
            migrationBuilder.Sql("TRUNCATE TABLE \"Questionnaires\" CASCADE;");

            // Drop the primary key constraint
            migrationBuilder.Sql("ALTER TABLE \"Questionnaires\" DROP CONSTRAINT \"PK_Questionnaires\";");

            // Drop the UUID Id column
            migrationBuilder.DropColumn(
                name: "Id",
                table: "Questionnaires");

            // Add the integer Id column back
            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Questionnaires",
                type: "integer",
                nullable: false)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            // Recreate the primary key constraint
            migrationBuilder.AddPrimaryKey(
                name: "PK_Questionnaires",
                table: "Questionnaires",
                column: "Id");

            // Revert foreign key columns back to int using drop/recreate approach
            
            // Handle QuestionnaireResponses.QuestionnaireId
            migrationBuilder.DropColumn(
                name: "QuestionnaireId",
                table: "QuestionnaireResponses");

            migrationBuilder.AddColumn<int>(
                name: "QuestionnaireId",
                table: "QuestionnaireResponses",
                type: "integer",
                nullable: false);

            // Handle Questions.QuestionnaireId
            migrationBuilder.DropColumn(
                name: "QuestionnaireId",
                table: "Questions");

            migrationBuilder.AddColumn<int>(
                name: "QuestionnaireId",
                table: "Questions",
                type: "integer",
                nullable: false);

            // Recreate foreign key constraints
            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Questionnaires_QuestionnaireId",
                table: "Questions",
                column: "QuestionnaireId",
                principalTable: "Questionnaires",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionnaireResponses_Questionnaires_QuestionnaireId",
                table: "QuestionnaireResponses",
                column: "QuestionnaireId",
                principalTable: "Questionnaires",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
