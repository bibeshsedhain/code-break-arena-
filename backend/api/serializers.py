from rest_framework import serializers
from .models import Challenge, TestCase

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['test_id', 'input_data', 'expected_output', 'hidden_flag']

class ChallengeSerializer(serializers.ModelSerializer):
    test_cases = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = Challenge
        fields = [
            'challenge_id', 'title', 'description', 'starter_code', 
            'difficulty', 'language', 'creator_username', 'test_cases'
        ]

    def get_test_cases(self, obj):
        # SECURITY: Only return visible test cases to the client unless the user is the creator
        request = self.context.get('request')
        if request and request.user == obj.creator:
            cases = obj.test_cases.all()
        else:
            cases = obj.test_cases.filter(hidden_flag=False)
        return TestCaseSerializer(cases, many=True).data

class ChallengeDetailSerializer(ChallengeSerializer):
    # Includes the solution code, but we'll restrict when this serializer is used
    class Meta(ChallengeSerializer.Meta):
        fields = ChallengeSerializer.Meta.fields + ['solution_code']