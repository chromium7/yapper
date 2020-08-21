# Generated by Django 3.0.8 on 2020-08-21 14:13

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_auto_20200821_2049'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='reply',
            options={'verbose_name_plural': 'replies'},
        ),
        migrations.RemoveField(
            model_name='post',
            name='like',
        ),
        migrations.RemoveField(
            model_name='post',
            name='like_count',
        ),
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to='network.Post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
