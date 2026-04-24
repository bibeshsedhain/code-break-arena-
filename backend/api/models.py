import uuid
from django.db import models
from django.conf import settings


class Challenge(models.Model):  # ✅ FIXED: was models.CharField
    """
    Represents a coding challenge created by a Maker.
    """

    class Difficulty(models.TextChoices):
        EASY = 'EZ', 'Easy'
        MEDIUM = 'MD', 'Medium'
        HARD = 'HD', 'Hard'

    challenge_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # User who created the challenge
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='challenges'
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    starter_code = models.TextField(
        help_text="The buggy starter code shown to the Taker."
    )
    solution_code = models.TextField(
        help_text="The intended solution to be revealed after 5 failures."
    )

    difficulty = models.CharField(
        max_length=2,
        choices=Difficulty.choices,
        default=Difficulty.EASY,
    )

    language = models.CharField(max_length=50, default='python')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_difficulty_display()})"


class TestCase(models.Model):
    """
    Represents a single input/output pair for evaluating a Challenge.
    """

    test_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='test_cases'
    )

    input_data = models.TextField(
        help_text="The arguments or standard input provided to the code."
    )
    expected_output = models.TextField(
        help_text="The exact expected stdout or return value."
    )

    hidden_flag = models.BooleanField(default=True)

    def __str__(self):
        return f"Test Case for {self.challenge.title} (Hidden: {self.hidden_flag})"


## tracking metrics 
class Attempt(models.Model):
    """
    Records a single code submission by a Taker.
    """
    RESULT_CHOICES = [
        ('PASS', 'Pass'),
        ('FAIL', 'Fail'),
        ('ERROR', 'Error'),
    ]

    attempt_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attempts')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='attempts')
    
    code_submission = models.TextField(help_text="The code submitted by the Taker.")
    result = models.CharField(max_length=10, choices=RESULT_CHOICES)
    
    attempt_number = models.PositiveIntegerField(default=1)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Automatically calculate the attempt number before saving to the database
        if not self.pk:
            previous_attempts = Attempt.objects.filter(user=self.user, challenge=self.challenge).count()
            self.attempt_number = previous_attempts + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Attempt {self.attempt_number} by {self.user} on {self.challenge.title} - {self.result}"


class UserMetrics(models.Model):
    """
    Tracks aggregated performance stats for a Taker on a specific Challenge.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='metrics')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='metrics')
    
    best_time = models.FloatField(null=True, blank=True, help_text="Fastest execution time in seconds.")
    total_attempts = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)

    class Meta:
        # Enforce data integrity: A user can only have one aggregated metrics record per challenge
        unique_together = ('user', 'challenge')

    def __str__(self):
        return f"Metrics for {self.user} on {self.challenge.title} (Completed: {self.completed})"