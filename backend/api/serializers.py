from rest_framework import serializers
from .models import Challenge, TestCase

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        # Ensure your frontend sends 'hidden_flag' explicitly
        fields = ['test_id', 'input_data', 'expected_output', 'hidden_flag']


class ChallengeSerializer(serializers.ModelSerializer):
    # 1. Direct mapping allows DRF to accept the array during POST requests
    test_cases = TestCaseSerializer(many=True, required=False)
    creator_username = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = Challenge
        # 2. ADDED 'solution_code' so DRF doesn't strip it during creation
        fields = [
            'challenge_id', 'title', 'description', 'starter_code', 
            'solution_code', 'difficulty', 'language', 'creator_username', 'test_cases'
        ]

    def create(self, validated_data):
        """Handles the POST request when clicking 'Launch Challenge'"""
        # Pop the nested test cases array (default to empty list if missing)
        test_cases_data = validated_data.pop('test_cases', [])
        
        # Create the main Challenge object
        challenge = Challenge.objects.create(**validated_data)
        
        # Loop through and create the linked Test Cases
        for tc_data in test_cases_data:
            TestCase.objects.create(challenge=challenge, **tc_data)
            
        return challenge

    def update(self, instance, validated_data):
        """Handles the PUT/PATCH requests when editing an existing challenge"""
        test_cases_data = validated_data.pop('test_cases', None)

        # Update the main Challenge fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # If test cases were provided, replace the old ones
        if test_cases_data is not None:
            instance.test_cases.all().delete() 
            for tc_data in test_cases_data:
                TestCase.objects.create(challenge=instance, **tc_data)

        return instance

    def to_representation(self, instance):
        """
        Intercepts the outgoing JSON to hide secrets from standard users.
        This runs every time data is requested (GET).
        """
        # Let DRF generate the full JSON first
        representation = super().to_representation(instance)
        request = self.context.get('request')

        # SECURITY CHECK: Is the person requesting this the creator?
        is_creator = request and request.user.is_authenticated and request.user == instance.creator

        if not is_creator:
            # 1. Filter out any test cases where hidden_flag is True
            representation['test_cases'] = [
                tc for tc in representation.get('test_cases', [])
                if tc.get('hidden_flag') == False
            ]
            
            # 2. Completely remove the solution code from the JSON
            representation.pop('solution_code', None) 
            
        return representation


class ChallengeDetailSerializer(ChallengeSerializer):
    """
    You might not even need this subclass anymore since `to_representation` 
    handles the security dynamically, but it's fine to leave if you use it elsewhere!
    """
    pass