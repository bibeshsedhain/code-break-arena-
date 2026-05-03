from rest_framework import serializers
from .models import Challenge, TestCase

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['test_id', 'input_data', 'expected_output', 'hidden_flag']

class ChallengeSerializer(serializers.ModelSerializer):
    # 1. Map to the serializer directly so DRF accepts incoming WRITE arrays
    test_cases = TestCaseSerializer(many=True, required=False)
    creator_username = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = Challenge
        fields = [
            'challenge_id', 'title', 'description', 'starter_code', 
            'difficulty', 'language', 'creator_username', 'test_cases'
        ]

    # 2. Add the missing CREATE method for POST requests
    def create(self, validated_data):
        test_cases_data = validated_data.pop('test_cases', [])
        
        # Create the main Challenge
        challenge = Challenge.objects.create(**validated_data)
        
        # Create the nested test cases
        for tc_data in test_cases_data:
            TestCase.objects.create(challenge=challenge, **tc_data)
            
        return challenge

    # 3. Your existing UPDATE method for PUT/PATCH requests
    def update(self, instance, validated_data):
        test_cases_data = validated_data.pop('test_cases', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if test_cases_data is not None:
            instance.test_cases.all().delete() 
            for tc_data in test_cases_data:
                TestCase.objects.create(challenge=instance, **tc_data)

        return instance

    # 4. Handle the SECURITY filtering on READ requests
    def to_representation(self, instance):
        # Let DRF serialize the data normally first
        representation = super().to_representation(instance)
        request = self.context.get('request')

        # If there is no request, or the user is NOT the creator, scrub the hidden tests
        if not request or request.user != instance.creator:
            # representation['test_cases'] is a list of dictionaries. We filter out the hidden ones.
            representation['test_cases'] = [
                tc for tc in representation.get('test_cases', [])
                if tc.get('hidden_flag') == False
            ]
            
        return representation

class ChallengeDetailSerializer(ChallengeSerializer):
    # Includes the solution code, but we'll restrict when this serializer is used
    class Meta(ChallengeSerializer.Meta):
        fields = ChallengeSerializer.Meta.fields + ['solution_code']