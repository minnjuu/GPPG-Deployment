# Generated by Django 5.1.1 on 2024-10-18 09:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pangolin', '0015_alter_gallery_image'),
    ]

    operations = [
        migrations.RenameField(
            model_name='gallery',
            old_name='image',
            new_name='media',
        ),
        migrations.AlterField(
            model_name='gallery',
            name='media_type',
            field=models.CharField(blank=True, choices=[('Image', 'Image'), ('Video', 'Video')], max_length=150),
        ),
    ]
