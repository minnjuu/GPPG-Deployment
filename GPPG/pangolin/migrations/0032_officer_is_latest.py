# Generated by Django 5.1.3 on 2024-11-25 04:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pangolin', '0031_alter_event_description_alter_incident_description_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='officer',
            name='is_latest',
            field=models.BooleanField(default=False),
        ),
    ]
