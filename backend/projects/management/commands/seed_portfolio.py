from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from projects.models import Project


class Command(BaseCommand):
    help = 'Seeds initial portfolio projects and creates demo user account'

    def handle(self, *args, **options):
        # Create demo user
        user, created = User.objects.get_or_create(
            username='demo_user',
            defaults={
                'email': 'demo@example.com',
                'first_name': 'Sathwik',
                'last_name': 'Ananthula'
            }
        )
        if created:
            user.set_password('StrongPassword123')
            user.save()
            self.stdout.write(self.style.SUCCESS("Created demo user: 'demo_user' (Password: 'StrongPassword123')"))
        else:
            self.stdout.write("Demo user 'demo_user' already exists.")

        # Create or retrieve auth token
        token, _ = Token.objects.get_or_create(user=user)
        self.stdout.write(self.style.SUCCESS(f"Auth Token for demo_user: {token.key}"))

        initial_projects = [
            {
                "title": "Fuelup: on-demand fuel delivery",
                "description": "A full-stack app that lets someone order petrol or diesel to their live location during an emergency or a trip. In progress: location-based service, online payment flow and a certified delivery workflow.",
                "technologies": "React, Node.js, JavaScript",
                "github_url": "https://github.com/sathwik3404-dev/fuelup",
                "live_demo_url": "https://fuelup-demo.example.com"
            },
            {
                "title": "Air quality and weather station",
                "description": "An ESP32 station with DHT11 and MQ135 sensors that measures temperature, humidity and air quality, streams readings to a ThingSpeak dashboard, and sends an alert when air quality turns unsafe.",
                "technologies": "ESP32, Embedded C, DHT11, MQ135, ThingSpeak",
                "github_url": "https://github.com/sathwik3404-dev/air-quality-station",
                "live_demo_url": "https://thingspeak.com/channels/demo"
            },
            {
                "title": "Smart home automation",
                "description": "Wi-Fi control of lights and appliances from a web or mobile interface. Devices talk over MQTT for low-latency switching, and a React dashboard shows and toggles their state in real time.",
                "technologies": "ESP32, Embedded C, MQTT, React",
                "github_url": "https://github.com/sathwik3404-dev/smart-home-automation",
                "live_demo_url": ""
            },
            {
                "title": "Smart dustbin",
                "description": "A contactless bin that opens its lid when an ultrasonic sensor detects a hand, driven by a servo motor and sensor logic written in Embedded C.",
                "technologies": "Arduino, Embedded C, Ultrasonic sensor, Servo motor",
                "github_url": "https://github.com/sathwik3404-dev/smart-dustbin",
                "live_demo_url": ""
            }
        ]

        count = 0
        for item in initial_projects:
            proj, p_created = Project.objects.get_or_create(
                title=item['title'],
                owner=user,
                defaults=item
            )
            if p_created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {count} portfolio projects successfully."))
